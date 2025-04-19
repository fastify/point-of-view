'use strict'
const { readFile } = require('node:fs/promises')
const fp = require('fastify-plugin')
const { accessSync, existsSync, mkdirSync, readdirSync } = require('node:fs')
const { basename, dirname, extname, join, resolve } = require('node:path')
const { LruMap } = require('toad-cache')
const supportedEngines = ['ejs', 'nunjucks', 'pug', 'handlebars', 'mustache', 'twig', 'liquid', 'dot', 'eta', 'edge']

const viewCache = Symbol('@fastify/view/cache')

const fastifyViewCache = fp(
  async function cachePlugin (fastify, opts) {
    const lru = new LruMap(opts.maxCache || 100)
    fastify.decorate(viewCache, lru)
  },
  {
    fastify: '5.x',
    name: '@fastify/view/cache'
  }
)

async function fastifyView (fastify, opts) {
  if (fastify[viewCache] === undefined) {
    await fastify.register(fastifyViewCache, opts)
  }
  if (!opts.engine) {
    throw new Error('Missing engine')
  }
  const type = Object.keys(opts.engine)[0]
  if (supportedEngines.indexOf(type) === -1) {
    throw new Error(`'${type}' not yet supported, PR? :)`)
  }
  const charset = opts.charset || 'utf-8'
  const propertyName = opts.propertyName || 'view'
  const asyncPropertyName = opts.asyncPropertyName || `${propertyName}Async`
  const engine = await opts.engine[type]
  const globalOptions = opts.options || {}
  const templatesDir = resolveTemplateDir(opts)
  const includeViewExtension = opts.includeViewExtension || false
  const viewExt = opts.viewExt || ''
  const prod = typeof opts.production === 'boolean' ? opts.production : process.env.NODE_ENV === 'production'
  const defaultCtx = opts.defaultContext
  const globalLayoutFileName = opts.layout

  /**
   * @type {Map<string, Promise>}
   */
  const readFileMap = new Map()

  function readFileSemaphore (filePath) {
    if (readFileMap.has(filePath) === false) {
      const promise = readFile(filePath, 'utf-8')
      readFileMap.set(filePath, promise)
      return promise.finally(() => readFileMap.delete(filePath))
    }
    return readFileMap.get(filePath)
  }

  function templatesDirIsValid (_templatesDir) {
    if (Array.isArray(_templatesDir) && type !== 'nunjucks') {
      throw new Error('Only Nunjucks supports the "templates" option as an array')
    }
  }

  function layoutIsValid (_layoutFileName) {
    if (type !== 'dot' && type !== 'handlebars' && type !== 'ejs' && type !== 'eta') {
      throw new Error('Only Dot, Handlebars, EJS and Eta support the "layout" option')
    }

    if (!hasAccessToLayoutFile(_layoutFileName, getDefaultExtension(type))) {
      throw new Error(`unable to access template "${_layoutFileName}"`)
    }
  }

  function setupNunjucksEnv (_engine) {
    if (type === 'nunjucks') {
      const env = _engine.configure(templatesDir, globalOptions)
      if (typeof globalOptions.onConfigure === 'function') {
        globalOptions.onConfigure(env)
      }
      return env
    }
    return null
  }

  templatesDirIsValid(templatesDir)

  if (globalLayoutFileName) {
    layoutIsValid(globalLayoutFileName)
  }

  const dotRender = type === 'dot' ? viewDot.call(fastify, preProcessDot.call(fastify, templatesDir, globalOptions)) : null
  const nunjucksEnv = setupNunjucksEnv(engine)

  const renders = {
    ejs: withLayout(viewEjs, globalLayoutFileName),
    handlebars: withLayout(viewHandlebars, globalLayoutFileName),
    mustache: viewMustache,
    nunjucks: viewNunjucks,
    twig: viewTwig,
    liquid: viewLiquid,
    dot: withLayout(dotRender, globalLayoutFileName),
    eta: withLayout(viewEta, globalLayoutFileName),
    edge: viewEdge,
    _default: view
  }

  const renderer = renders[type] ? renders[type] : renders._default

  async function asyncRender (page) {
    if (!page) {
      throw new Error('Missing page')
    }

    let result = await renderer.apply(this, arguments)

    if (minify && !isPathExcludedMinification(this)) {
      result = await minify(result, globalOptions.htmlMinifierOptions)
    }

    if (this.getHeader && !this.getHeader('Content-Type')) {
      this.header('Content-Type', 'text/html; charset=' + charset)
    }

    return result
  }

  function viewDecorator () {
    const args = Array.from(arguments)

    let done
    if (typeof args[args.length - 1] === 'function') {
      done = args.pop()
    }

    const promise = asyncRender.apply({}, args)

    if (typeof done === 'function') {
      promise.then(done.bind(null, null), done)
      return
    }

    return promise
  }

  viewDecorator.clearCache = function () {
    fastify[viewCache].clear()
  }

  fastify.decorate(propertyName, viewDecorator)

  fastify.decorateReply(propertyName, async function (page, data, opts) {
    try {
      const html = await asyncRender.call(this, page, data, opts)
      this.send(html)
    } catch (err) {
      this.send(err)
    }

    return this
  })

  fastify.decorateReply(asyncPropertyName, asyncRender)

  if (!fastify.hasReplyDecorator('locals')) {
    fastify.decorateReply('locals', null)

    fastify.addHook('onRequest', (_req, reply, done) => {
      reply.locals = {}
      done()
    })
  }

  function getPage (page, extension) {
    const pageLRU = `getPage-${page}-${extension}`
    let result = fastify[viewCache].get(pageLRU)

    if (typeof result === 'string') {
      return result
    }

    const filename = basename(page, extname(page))
    result = join(dirname(page), filename + getExtension(page, extension))

    fastify[viewCache].set(pageLRU, result)

    return result
  }

  function getDefaultExtension (type) {
    const mappedExtensions = {
      handlebars: 'hbs',
      nunjucks: 'njk'
    }

    return viewExt || (mappedExtensions[type] || type)
  }

  function getExtension (page, extension) {
    let filextension = extname(page)
    if (!filextension) {
      filextension = '.' + getDefaultExtension(type)
    }

    return viewExt ? `.${viewExt}` : (includeViewExtension ? `.${extension}` : filextension)
  }

  const minify = typeof globalOptions.useHtmlMinifier?.minify === 'function'
    ? globalOptions.useHtmlMinifier.minify
    : null

  const minifyExcludedPaths = Array.isArray(globalOptions.pathsToExcludeHtmlMinifier)
    ? new Set(globalOptions.pathsToExcludeHtmlMinifier)
    : null

  function getRequestedPath (fastify) {
    return fastify?.request?.routeOptions.url ?? null
  }
  function isPathExcludedMinification (that) {
    return minifyExcludedPaths?.has(getRequestedPath(that))
  }
  function onTemplatesLoaded (file, data) {
    if (type === 'handlebars') {
      data = engine.compile(data, globalOptions.compileOptions)
    }
    fastify[viewCache].set(file, data)
    return data
  }

  // Gets template as string (or precompiled for Handlebars)
  // from LRU cache or filesystem.
  const getTemplate = async function (file) {
    if (typeof file === 'function') {
      return file
    }
    let isRaw = false
    if (typeof file === 'object' && file.raw) {
      isRaw = true
      file = file.raw
    }
    const data = fastify[viewCache].get(file)
    if (data && prod) {
      return data
    }
    if (isRaw) {
      return onTemplatesLoaded(file, file)
    }
    const fileData = await readFileSemaphore(join(templatesDir, file))
    return onTemplatesLoaded(file, fileData)
  }

  // Gets partials as collection of strings from LRU cache or filesystem.
  const getPartials = async function (page, { partials, requestedPath }) {
    const cacheKey = getPartialsCacheKey(page, partials, requestedPath)
    const partialsObj = fastify[viewCache].get(cacheKey)
    if (partialsObj && prod) {
      return partialsObj
    } else {
      const partialKeys = Object.keys(partials)
      if (partialKeys.length === 0) {
        return {}
      }
      const partialsHtml = {}
      await Promise.all(partialKeys.map(async (key) => {
        partialsHtml[key] = await readFileSemaphore(join(templatesDir, partials[key]))
      }))
      fastify[viewCache].set(cacheKey, partialsHtml)
      return partialsHtml
    }
  }

  function getPartialsCacheKey (page, partials, requestedPath) {
    let cacheKey = page

    for (const key of Object.keys(partials)) {
      cacheKey += `|${key}:${partials[key]}`
    }

    cacheKey += `|${requestedPath}-Partials`

    return cacheKey
  }

  function readCallbackParser (page, html, localOptions) {
    if ((type === 'ejs') && viewExt && !globalOptions.includer) {
      globalOptions.includer = (originalPath, parsedPath) => ({
        filename: parsedPath || join(templatesDir, originalPath + '.' + viewExt)
      })
    }
    if (localOptions) {
      for (const key in globalOptions) {
        if (!Object.hasOwn(localOptions, key)) localOptions[key] = globalOptions[key]
      }
    } else localOptions = globalOptions

    const compiledPage = engine.compile(html, localOptions)

    fastify[viewCache].set(page, compiledPage)
    return compiledPage
  }

  function readCallback (page, _data, localOptions, html) {
    globalOptions.filename = join(templatesDir, page)
    return readCallbackParser(page, html, localOptions)
  }

  function preProcessDot (templatesDir, options) {
    // Process all templates to in memory functions
    // https://github.com/olado/doT#security-considerations
    const destinationDir = options.destination || join(__dirname, 'out')
    if (!existsSync(destinationDir)) {
      mkdirSync(destinationDir)
    }

    const renderer = engine.process(Object.assign(
      {},
      options,
      {
        path: templatesDir,
        destination: destinationDir
      }
    ))

    // .jst files are compiled to .js files so we need to require them
    for (const file of readdirSync(destinationDir, { withFileTypes: false })) {
      renderer[basename(file, '.js')] = require(resolve(join(destinationDir, file)))
    }
    if (Object.keys(renderer).length === 0) {
      this.log.warn(`WARN: no template found in ${templatesDir}`)
    }

    return renderer
  }

  async function view (page, data, opts) {
    data = Object.assign({}, defaultCtx, this.locals, data)
    if (typeof page === 'function') {
      return page(data)
    }
    let isRaw = false
    if (typeof page === 'object' && page.raw) {
      isRaw = true
      page = page.raw.toString()
    } else {
      // append view extension
      page = getPage(page, type)
    }
    const toHtml = fastify[viewCache].get(page)

    if (toHtml && prod) {
      return toHtml(data)
    } else if (isRaw) {
      const compiledPage = readCallbackParser(page, page, opts)
      return compiledPage(data)
    }

    const file = await readFileSemaphore(join(templatesDir, page))
    const render = readCallback(page, data, opts, file)
    return render(data)
  }

  async function viewEjs (page, data, opts) {
    if (opts?.layout) {
      layoutIsValid(opts.layout)
      return withLayout(viewEjs, opts.layout).call(this, page, data)
    }
    data = Object.assign({}, defaultCtx, this.locals, data)
    if (typeof page === 'function') {
      return page(data)
    }
    let isRaw = false
    if (typeof page === 'object' && page.raw) {
      isRaw = true
      page = page.raw.toString()
    } else {
      // append view extension
      page = getPage(page, type)
    }
    const toHtml = fastify[viewCache].get(page)

    if (toHtml && prod) {
      return toHtml(data)
    } else if (isRaw) {
      const compiledPage = readCallbackParser(page, page, opts)
      return compiledPage(data)
    }

    const file = await readFileSemaphore(join(templatesDir, page))
    const render = readCallback(page, data, opts, file)
    return render(data)
  }

  async function viewNunjucks (page, data) {
    data = Object.assign({}, defaultCtx, this.locals, data)
    let render
    if (typeof page === 'string') {
      // Append view extension.
      page = getPage(page, 'njk')
      render = nunjucksEnv.render.bind(nunjucksEnv, page)
    } else if (typeof page === 'object' && typeof page.render === 'function') {
      render = page.render.bind(page)
    } else if (typeof page === 'object' && page.raw) {
      render = nunjucksEnv.renderString.bind(nunjucksEnv, page.raw.toString())
    } else {
      throw new Error('Unknown template type')
    }
    return new Promise((resolve, reject) => {
      render(data, (err, html) => {
        if (err) {
          reject(err)
          return
        }

        resolve(html)
      })
    })
  }

  async function viewHandlebars (page, data, opts) {
    if (opts?.layout) {
      layoutIsValid(opts.layout)
      return withLayout(viewHandlebars, opts.layout).call(this, page, data)
    }

    let options

    if (globalOptions.useDataVariables) {
      options = {
        data: defaultCtx ? Object.assign({}, defaultCtx, this.locals) : this.locals
      }
    } else {
      data = Object.assign({}, defaultCtx, this.locals, data)
    }

    if (typeof page === 'string') {
      // append view extension
      page = getPage(page, 'hbs')
    }
    const requestedPath = getRequestedPath(this)
    const template = await getTemplate(page)

    if (prod) {
      return template(data, options)
    } else {
      const partialsObject = await getPartials(type, { partials: globalOptions.partials || {}, requestedPath })

      Object.keys(partialsObject).forEach((name) => {
        engine.registerPartial(name, engine.compile(partialsObject[name], globalOptions.compileOptions))
      })

      return template(data, options)
    }
  }

  async function viewMustache (page, data, opts) {
    const options = Object.assign({}, opts)
    data = Object.assign({}, defaultCtx, this.locals, data)
    if (typeof page === 'string') {
      // append view extension
      page = getPage(page, 'mustache')
    }
    const partials = Object.assign({}, globalOptions.partials || {}, options.partials || {})
    const requestedPath = getRequestedPath(this)
    const templateString = await getTemplate(page)
    const partialsObject = await getPartials(page, { partials, requestedPath })

    let html
    if (typeof templateString === 'function') {
      html = templateString(data, partialsObject)
    } else {
      html = engine.render(templateString, data, partialsObject)
    }

    return html
  }

  async function viewTwig (page, data) {
    data = Object.assign({}, defaultCtx, globalOptions, this.locals, data)
    let render
    if (typeof page === 'string') {
      // Append view extension.
      page = getPage(page, 'twig')
      render = engine.renderFile.bind(engine, join(templatesDir, page))
    } else if (typeof page === 'object' && typeof page.render === 'function') {
      render = (data, cb) => cb(null, page.render(data))
    } else if (typeof page === 'object' && page.raw) {
      render = (data, cb) => cb(null, engine.twig({ data: page.raw.toString() }).render(data))
    } else {
      throw new Error('Unknown template type')
    }
    return new Promise((resolve, reject) => {
      render(data, (err, html) => {
        if (err) {
          reject(err)
          return
        }

        resolve(html)
      })
    })
  }

  async function viewLiquid (page, data, opts) {
    data = Object.assign({}, defaultCtx, this.locals, data)
    let render
    if (typeof page === 'string') {
      // Append view extension.
      page = getPage(page, 'liquid')
      render = engine.renderFile.bind(engine, join(templatesDir, page))
    } else if (typeof page === 'function') {
      render = page
    } else if (typeof page === 'object' && page.raw) {
      const templates = engine.parse(page.raw)
      render = engine.render.bind(engine, templates)
    }

    return render(data, opts)
  }

  function viewDot (renderModule) {
    return async function _viewDot (page, data, opts) {
      if (opts?.layout) {
        layoutIsValid(opts.layout)
        return withLayout(dotRender, opts.layout).call(this, page, data)
      }
      data = Object.assign({}, defaultCtx, this.locals, data)
      let render
      if (typeof page === 'function') {
        render = page
      } else if (typeof page === 'object' && page.raw) {
        render = engine.template(page.raw.toString(), { ...engine.templateSettings, ...globalOptions, ...page.settings }, page.imports)
      } else {
        render = renderModule[page]
      }
      return render(data)
    }
  }

  async function viewEta (page, data, opts) {
    if (opts?.layout) {
      layoutIsValid(opts.layout)
      return withLayout(viewEta, opts.layout).call(this, page, data)
    }

    if (globalOptions.templatesSync) {
      engine.templatesSync = globalOptions.templatesSync
    }

    engine.configure({
      views: templatesDir,
      cache: prod || globalOptions.templatesSync
    })

    const config = Object.assign({
      cache: prod,
      views: templatesDir
    }, globalOptions)

    data = Object.assign({}, defaultCtx, this.locals, data)

    if (typeof page === 'function') {
      const ret = await page.call(engine, data, config)
      return ret
    }

    let render, renderAsync
    if (typeof page === 'object' && page.raw) {
      page = page.raw.toString()
      render = engine.renderString.bind(engine)
      renderAsync = engine.renderStringAsync.bind(engine)
    } else {
      // Append view extension (Eta will append '.eta' by default,
      // but this also allows custom extensions)
      page = getPage(page, 'eta')
      render = engine.render.bind(engine)
      renderAsync = engine.renderAsync.bind(engine)
    }

    /* c8 ignore next */
    if (opts?.async ?? globalOptions.async) {
      return renderAsync(page, data, config)
    } else {
      return render(page, data, config)
    }
  }

  if (prod && type === 'handlebars' && globalOptions.partials) {
    const partialsObject = await getPartials(type, { partials: globalOptions.partials, requestedPath: getRequestedPath(this) })
    Object.keys(partialsObject).forEach((name) => {
      engine.registerPartial(name, engine.compile(partialsObject[name], globalOptions.compileOptions))
    })
  }

  async function viewEdge (page, data, opts) {
    data = Object.assign({}, defaultCtx, this.locals, data)

    switch (typeof page) {
      case 'string':
        return engine.render(getPage(page, 'edge'), data)
      case 'function':
        return page(data)
      case 'object':
        return engine.renderRaw(page, data)
      default:
        throw new Error('Unknown page type')
    }
  }

  function withLayout (render, layout) {
    if (layout) {
      return async function (page, data, opts) {
        if (opts?.layout) throw new Error('A layout can either be set globally or on render, not both.')
        data = Object.assign({}, defaultCtx, this.locals, data)
        const result = await render.call(this, page, data, opts)
        data = Object.assign(data, { body: result })
        return render.call(this, layout, data, opts)
      }
    }
    return render
  }

  function resolveTemplateDir (_opts) {
    if (_opts.root) {
      return _opts.root
    }

    return Array.isArray(_opts.templates)
      ? _opts.templates.map((dir) => resolve(dir))
      : resolve(_opts.templates || './')
  }

  function hasAccessToLayoutFile (fileName, ext) {
    const layoutKey = `layout-${fileName}-${ext}`
    let result = fastify[viewCache].get(layoutKey)

    if (typeof result === 'boolean') {
      return result
    }

    try {
      accessSync(join(templatesDir, getPage(fileName, ext)))
      result = true
    } catch {
      result = false
    }

    fastify[viewCache].set(layoutKey, result)

    return result
  }
}

module.exports = fp(fastifyView, {
  fastify: '5.x',
  name: '@fastify/view'
})
module.exports.default = fastifyView
module.exports.fastifyView = fastifyView
module.exports.fastifyViewCache = viewCache
