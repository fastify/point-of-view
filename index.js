'use strict'

const fp = require('fastify-plugin')
const { accessSync, existsSync, mkdirSync, readdirSync, readFile } = require('node:fs')
const { basename, dirname, extname, join, resolve } = require('node:path')
const HLRU = require('hashlru')
const supportedEngines = ['ejs', 'nunjucks', 'pug', 'handlebars', 'mustache', 'art-template', 'twig', 'liquid', 'dot', 'eta']

function fastifyView (fastify, opts, next) {
  if (!opts.engine) {
    next(new Error('Missing engine'))
    return
  }
  const type = Object.keys(opts.engine)[0]
  if (supportedEngines.indexOf(type) === -1) {
    next(new Error(`'${type}' not yet supported, PR? :)`))
    return
  }
  const charset = opts.charset || 'utf-8'
  const propertyName = opts.propertyName || 'view'
  const engine = opts.engine[type]
  const globalOptions = opts.options || {}
  const templatesDir = resolveTemplateDir(opts)
  const lru = HLRU(opts.maxCache || 100)
  const includeViewExtension = opts.includeViewExtension || false
  const viewExt = opts.viewExt || ''
  const prod = typeof opts.production === 'boolean' ? opts.production : process.env.NODE_ENV === 'production'
  const defaultCtx = opts.defaultContext
  const globalLayoutFileName = opts.layout

  function templatesDirIsValid (_templatesDir) {
    if (Array.isArray(_templatesDir) && type !== 'nunjucks') {
      throw new Error('Only Nunjucks supports the "templates" option as an array')
    }
  }

  function layoutIsValid (_layoutFileName) {
    if (type !== 'dot' && type !== 'handlebars' && type !== 'ejs' && type !== 'eta') {
      throw new Error('Only Dot, Handlebars, EJS, and Eta support the "layout" option')
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

  try {
    templatesDirIsValid(templatesDir)

    if (globalLayoutFileName) {
      layoutIsValid(globalLayoutFileName)
    }
  } catch (error) {
    next(error)
    return
  }

  const dotRender = type === 'dot' ? viewDot.call(fastify, preProcessDot.call(fastify, templatesDir, globalOptions)) : null
  const nunjucksEnv = setupNunjucksEnv(engine)

  const renders = {
    ejs: withLayout(viewEjs, globalLayoutFileName),
    handlebars: withLayout(viewHandlebars, globalLayoutFileName),
    mustache: viewMustache,
    nunjucks: viewNunjucks,
    'art-template': viewArtTemplate,
    twig: viewTwig,
    liquid: viewLiquid,
    dot: withLayout(dotRender, globalLayoutFileName),
    eta: withLayout(viewEta, globalLayoutFileName),
    _default: view
  }

  const renderer = renders[type] ? renders[type] : renders._default

  function viewDecorator () {
    const args = Array.from(arguments)

    let done
    if (typeof args[args.length - 1] === 'function') {
      done = args.pop()
    }

    const promise = new Promise((resolve, reject) => {
      renderer.apply({
        getHeader: () => { },
        header: () => { },
        send: result => {
          if (result instanceof Error) {
            reject(result)
            return
          }

          resolve(result)
        }
      }, args)
    })

    if (done && typeof done === 'function') {
      promise.then(done.bind(null, null), done)
      return
    }

    return promise
  }

  viewDecorator.clearCache = function () {
    lru.clear()
  }

  fastify.decorate(propertyName, viewDecorator)

  fastify.decorateReply(propertyName, function () {
    renderer.apply(this, arguments)
    return this
  })

  if (!fastify.hasReplyDecorator('locals')) {
    fastify.decorateReply('locals', null)

    fastify.addHook('onRequest', (req, reply, done) => {
      reply.locals = {}
      done()
    })
  }

  function getPage (page, extension) {
    const pageLRU = `getPage-${page}-${extension}`
    let result = lru.get(pageLRU)

    if (typeof result === 'string') {
      return result
    }

    const filename = basename(page, extname(page))
    result = join(dirname(page), filename + getExtension(page, extension))

    lru.set(pageLRU, result)

    return result
  }

  function getDefaultExtension (type) {
    const mappedExtensions = {
      'art-template': 'art',
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

  function isPathExcludedMinification (currentPath, pathsToExclude) {
    return (pathsToExclude && Array.isArray(pathsToExclude)) ? pathsToExclude.includes(currentPath) : false
  }

  function useHtmlMinification (globalOpts, requestedPath) {
    return globalOptions.useHtmlMinifier &&
      (typeof globalOptions.useHtmlMinifier.minify === 'function') &&
      !isPathExcludedMinification(requestedPath, globalOptions.pathsToExcludeHtmlMinifier)
  }

  function getRequestedPath (fastify) {
    return (fastify && fastify.request) ? fastify.request.routeOptions.url : null
  }
  function onTemplatesLoaded (file, data, callback, requestedPath) {
    if (useHtmlMinification(globalOptions, requestedPath)) {
      data = globalOptions.useHtmlMinifier.minify(data, globalOptions.htmlMinifierOptions || {})
    }
    if (type === 'handlebars') {
      data = engine.compile(data, globalOptions.compileOptions)
    }
    lru.set(file, data)
    callback(null, data)
  }
  // Gets template as string (or precompiled for Handlebars)
  // from LRU cache or filesystem.
  const getTemplate = function (file, callback, requestedPath) {
    if (typeof file === 'function') {
      callback(null, file)
      return
    }
    let isRaw = false
    if (typeof file === 'object' && file.raw) {
      isRaw = true
      file = file.raw
    }
    const data = lru.get(file)
    if (data && prod) {
      callback(null, data)
      return
    }
    if (isRaw) {
      onTemplatesLoaded(file, file, callback, requestedPath)
      return
    }
    readFile(join(templatesDir, file), 'utf-8', (err, data) => {
      if (err) {
        callback(err, null)
        return
      }
      onTemplatesLoaded(file, data, callback, requestedPath)
    })
  }

  // Gets partials as collection of strings from LRU cache or filesystem.
  const getPartials = function (page, { partials, requestedPath }, callback) {
    const cacheKey = getPartialsCacheKey(page, partials, requestedPath)
    const partialsObj = lru.get(cacheKey)
    if (partialsObj && prod) {
      callback(null, partialsObj)
    } else {
      let filesToLoad = Object.keys(partials).length
      if (filesToLoad === 0) {
        callback(null, {})
        return
      }
      let error = null
      const partialsHtml = {}
      Object.keys(partials).forEach((key, index) => {
        readFile(join(templatesDir, partials[key]), 'utf-8', (err, data) => {
          if (err) {
            error = err
          }
          if (useHtmlMinification(globalOptions, requestedPath)) {
            data = globalOptions.useHtmlMinifier.minify(data, globalOptions.htmlMinifierOptions || {})
          }

          partialsHtml[key] = data
          if (--filesToLoad === 0) {
            lru.set(cacheKey, partialsHtml)
            callback(error, partialsHtml)
          }
        })
      })
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

  function readCallbackEnd (that, compile, data, localOptions) {
    let cachedPage
    try {
      cachedPage = compile(data)
    } catch (error) {
      cachedPage = error
    }
    if (!that.getHeader('content-type')) {
      that.header('Content-Type', 'text/html; charset=' + charset)
    }
    const requestedPath = getRequestedPath(that)
    if (!localOptions) {
      localOptions = globalOptions
    }
    if (type === 'ejs' && ((localOptions.async ?? globalOptions.async) || cachedPage instanceof Promise)) {
      cachedPage.then(html => {
        if (useHtmlMinification(globalOptions, requestedPath)) {
          html = globalOptions.useHtmlMinifier.minify(html, globalOptions.htmlMinifierOptions || {})
        }
        that.send(html)
      }).catch(err => that.send(err))
      return
    }
    if (useHtmlMinification(globalOptions, requestedPath)) {
      cachedPage = globalOptions.useHtmlMinifier.minify(cachedPage, globalOptions.htmlMinifierOptions || {})
    }
    that.send(cachedPage)
  }

  function readCallbackParser (that, page, html, localOptions) {
    let compiledPage
    try {
      if ((type === 'ejs') && viewExt && !globalOptions.includer) {
        globalOptions.includer = (originalPath, parsedPath) => {
          return {
            filename: parsedPath || join(templatesDir, originalPath + '.' + viewExt)
          }
        }
      }
      if (localOptions) {
        for (const key in globalOptions) {
          if (!Object.prototype.hasOwnProperty.call(localOptions, key)) localOptions[key] = globalOptions[key]
        }
      } else localOptions = globalOptions
      compiledPage = engine.compile(html, localOptions)
    } catch (error) {
      that.send(error)
      return
    }
    lru.set(page, compiledPage)
    return compiledPage
  }

  function readCallback (that, page, data, localOptions) {
    return function _readCallback (err, html) {
      if (err) {
        that.send(err)
        return
      }

      globalOptions.filename = join(templatesDir, page)
      const compiledPage = readCallbackParser(that, page, html, localOptions)
      readCallbackEnd(that, compiledPage, data, localOptions)
    }
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

  function view (page, data, opts) {
    if (!page) {
      this.send(new Error('Missing page'))
      return
    }

    data = Object.assign({}, defaultCtx, this.locals, data)
    if (typeof page === 'function') {
      readCallbackEnd(this, page, data, opts)
      return
    }
    let isRaw = false
    if (typeof page === 'object' && page.raw) {
      isRaw = true
      page = page.raw.toString()
    } else {
      // append view extension
      page = getPage(page, type)
    }

    const toHtml = lru.get(page)

    if (toHtml && prod) {
      readCallbackEnd(this, toHtml, data, opts)
      return
    }
    if (isRaw) {
      const compiledPage = readCallbackParser(this, page, page, opts)
      readCallbackEnd(this, compiledPage, data, opts)
      return
    }
    readFile(join(templatesDir, page), 'utf8', readCallback(this, page, data, opts))
  }

  function viewEjs (page, data, opts) {
    if (opts && opts.layout) {
      try {
        layoutIsValid(opts.layout)
        const that = this
        return withLayout(viewEjs, opts.layout).call(that, page, data)
      } catch (error) {
        this.send(error)
        return
      }
    }

    if (!page) {
      this.send(new Error('Missing page'))
      return
    }
    data = Object.assign({}, defaultCtx, this.locals, data)
    if (typeof page === 'function') {
      readCallbackEnd(this, page, data, opts)
      return
    }
    let isRaw = false
    if (typeof page === 'object' && page.raw) {
      isRaw = true
      page = page.raw.toString()
    } else {
      // append view extension
      page = getPage(page, type)
    }
    const toHtml = lru.get(page)

    if (toHtml && prod) {
      readCallbackEnd(this, toHtml, data, opts)
      return
    }
    if (isRaw) {
      const compiledPage = readCallbackParser(this, page, page, opts)
      readCallbackEnd(this, compiledPage, data, opts)
      return
    }
    readFile(join(templatesDir, page), 'utf8', readCallback(this, page, data, opts))
  }

  function viewArtTemplate (page, data) {
    if (!page) {
      this.send(new Error('Missing page'))
      return
    }
    data = Object.assign({}, defaultCtx, this.locals, data)

    if (typeof page === 'string') {
      // Append view extension.
      page = getPage(page, 'art')
    }

    const defaultSetting = {
      debug: process.env.NODE_ENV !== 'production',
      root: templatesDir
    }

    // merge engine options
    const confs = Object.assign({}, defaultSetting, globalOptions)

    function render (filename, data) {
      let render
      if (typeof filename === 'string') {
        confs.filename = join(templatesDir, filename)
        render = engine.compile(confs)
      } else if (typeof filename === 'function') {
        render = filename
      } else if (typeof filename === 'object' && filename.raw) {
        confs.source = filename.raw.toString()
        render = engine.compile(confs)
      } else {
        throw new Error('Unknown template type')
      }
      return render(data)
    }

    try {
      const html = render(page, data)
      if (!this.getHeader('content-type')) {
        this.header('Content-Type', 'text/html; charset=' + charset)
      }
      this.send(html)
    } catch (error) {
      this.send(error)
    }
  }

  function viewNunjucks (page, data) {
    if (!page) {
      this.send(new Error('Missing page'))
      return
    }
    data = Object.assign({}, defaultCtx, this.locals, data)
    let render
    if (typeof page === 'string') {
      // Append view extension.
      page = getPage(page, 'njk')
      // template = nunjucksEnv.getTemplate(page)
      render = nunjucksEnv.render.bind(nunjucksEnv, page)
    } else if (typeof page === 'object' && typeof page.render === 'function') {
      render = page.render.bind(page)
    } else if (typeof page === 'object' && page.raw) {
      render = nunjucksEnv.renderString.bind(nunjucksEnv, page.raw.toString())
    } else {
      throw new Error('Unknown template type')
    }
    render(data, (err, html) => {
      const requestedPath = getRequestedPath(this)
      if (err) return this.send(err)
      if (useHtmlMinification(globalOptions, requestedPath)) {
        html = globalOptions.useHtmlMinifier.minify(html, globalOptions.htmlMinifierOptions || {})
      }
      if (!this.getHeader('content-type')) {
        this.header('Content-Type', 'text/html; charset=' + charset)
      }
      this.send(html)
    })
  }

  function viewHandlebars (page, data, opts) {
    if (opts && opts.layout) {
      try {
        layoutIsValid(opts.layout)
        const that = this
        return withLayout(viewHandlebars, opts.layout).call(that, page, data)
      } catch (error) {
        this.send(error)
        return
      }
    }

    if (!page) {
      this.send(new Error('Missing page'))
      return
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
    getTemplate(page, (err, template) => {
      if (err) {
        this.send(err)
        return
      }

      if (prod) {
        try {
          const html = template(data, options)
          if (!this.getHeader('content-type')) {
            this.header('Content-Type', 'text/html; charset=' + charset)
          }
          this.send(html)
        } catch (e) {
          this.send(e)
        }
      } else {
        getPartials(type, { partials: globalOptions.partials || {}, requestedPath }, (err, partialsObject) => {
          if (err) {
            this.send(err)
            return
          }

          try {
            Object.keys(partialsObject).forEach((name) => {
              engine.registerPartial(name, engine.compile(partialsObject[name], globalOptions.compileOptions))
            })

            const html = template(data, options)

            if (!this.getHeader('content-type')) {
              this.header('Content-Type', 'text/html; charset=' + charset)
            }
            this.send(html)
          } catch (e) {
            this.send(e)
          }
        })
      }
    }, requestedPath)
  }

  function viewMustache (page, data, opts) {
    if (!page) {
      this.send(new Error('Missing page'))
      return
    }

    const options = Object.assign({}, opts)
    data = Object.assign({}, defaultCtx, this.locals, data)
    if (typeof page === 'string') {
      // append view extension
      page = getPage(page, 'mustache')
    }
    const requestedPath = getRequestedPath(this)
    getTemplate(page, (err, templateString) => {
      if (err) {
        this.send(err)
        return
      }
      getPartials(page, { partials: options.partials || {}, requestedPath }, (err, partialsObject) => {
        if (err) {
          this.send(err)
          return
        }
        let html
        if (typeof templateString === 'function') {
          html = templateString(data, partialsObject)
        } else {
          html = engine.render(templateString, data, partialsObject)
        }

        if (!this.getHeader('content-type')) {
          this.header('Content-Type', 'text/html; charset=' + charset)
        }
        this.send(html)
      })
    }, requestedPath)
  }

  function viewTwig (page, data, opts) {
    if (!page) {
      this.send(new Error('Missing page'))
      return
    }

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
    render(data, (err, html) => {
      const requestedPath = getRequestedPath(this)
      if (err) {
        return this.send(err)
      }
      if (useHtmlMinification(globalOptions, requestedPath)) {
        html = globalOptions.useHtmlMinifier.minify(html, globalOptions.htmlMinifierOptions || {})
      }
      if (!this.getHeader('content-type')) {
        this.header('Content-Type', 'text/html; charset=' + charset)
      }
      this.send(html)
    })
  }

  function viewLiquid (page, data, opts) {
    if (!page) {
      this.send(new Error('Missing page'))
      return
    }

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

    render(data, opts)
      .then((html) => {
        const requestedPath = getRequestedPath(this)
        if (useHtmlMinification(globalOptions, requestedPath)) {
          html = globalOptions.useHtmlMinifier.minify(html, globalOptions.htmlMinifierOptions || {})
        }
        if (!this.getHeader('content-type')) {
          this.header('Content-Type', 'text/html; charset=' + charset)
        }
        this.send(html)
      })
      .catch((err) => {
        this.send(err)
      })
  }

  function viewDot (renderModule) {
    return function _viewDot (page, data, opts) {
      if (opts && opts.layout) {
        try {
          layoutIsValid(opts.layout)
          const that = this
          return withLayout(dotRender, opts.layout).call(that, page, data)
        } catch (error) {
          this.send(error)
          return
        }
      }
      if (!page) {
        this.send(new Error('Missing page'))
        return
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
      let html = render(data)
      const requestedPath = getRequestedPath(this)
      if (useHtmlMinification(globalOptions, requestedPath)) {
        html = globalOptions.useHtmlMinifier.minify(html, globalOptions.htmlMinifierOptions || {})
      }
      if (!this.getHeader('content-type')) {
        this.header('Content-Type', 'text/html; charset=' + charset)
      }
      this.send(html)
    }
  }

  function viewEta (page, data, opts) {
    if (opts && opts.layout) {
      try {
        layoutIsValid(opts.layout)
        const that = this
        return withLayout(viewEta, opts.layout).call(that, page, data)
      } catch (error) {
        this.send(error)
        return
      }
    }

    if (!page) {
      this.send(new Error('Missing page'))
      return
    }

    if (globalOptions.templatesSync) {
      engine.templatesSync = globalOptions.templatesSync
    }

    lru.define = lru.set

    engine.configure({
      views: templatesDir,
      cache: prod || globalOptions.templatesSync
    })

    const config = Object.assign({
      cache: prod,
      views: templatesDir
    }, globalOptions)

    const sendContent = html => {
      if (
        config.useHtmlMinifier &&
        typeof config.useHtmlMinifier.minify === 'function' &&
        !isPathExcludedMinification(getRequestedPath(this), config.pathsToExcludeHtmlMinifier)
      ) {
        html = config.useHtmlMinifier.minify(
          html,
          config.htmlMinifierOptions || {}
        )
      }
      this.header('Content-Type', 'text/html; charset=' + charset)
      this.send(html)
    }

    data = Object.assign({}, defaultCtx, this.locals, data)

    if (typeof page === 'function') {
      try {
        const ret = page.call(engine, data, config)
        if (ret instanceof Promise) {
          ret.then(sendContent).catch(err => {
            this.send(err)
          })
        } else {
          sendContent(ret)
        }
      } catch (err) {
        this.send(err)
      }
      return
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

    if (opts?.async ?? globalOptions.async) {
      renderAsync(page, data, config)
        .then((res) => {
          sendContent(res)
        })
        .catch(err => {
          this.send(err)
        })
    } else {
      try {
        const html = render(page, data, config)
        sendContent(html)
      } catch (err) {
        this.send(err)
      }
    }
  }

  if (prod && type === 'handlebars' && globalOptions.partials) {
    getPartials(type, { partials: globalOptions.partials, requestedPath: getRequestedPath(this) }, (err, partialsObject) => {
      if (err) {
        next(err)
        return
      }
      Object.keys(partialsObject).forEach((name) => {
        engine.registerPartial(name, engine.compile(partialsObject[name], globalOptions.compileOptions))
      })
      next()
    })
  } else {
    next()
  }

  function withLayout (render, layout) {
    if (layout) {
      return function (page, data, opts) {
        if (opts && opts.layout) throw new Error('A layout can either be set globally or on render, not both.')
        const that = this
        data = Object.assign({}, defaultCtx, this.locals, data)
        render.call({
          getHeader: () => { },
          header: () => { },
          send: (result) => {
            if (result instanceof Error) {
              that.send(result)
              return
            }

            data = Object.assign(data, { body: result })
            render.call(that, layout, data, opts)
          }
        }, page, data, opts)
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
    try {
      accessSync(join(templatesDir, getPage(fileName, ext)))

      return true
    } catch (e) {
      return false
    }
  }
}

module.exports = fp(fastifyView, {
  fastify: '4.x',
  name: '@fastify/view'
})
module.exports.default = fastifyView
module.exports.fastifyView = fastifyView
