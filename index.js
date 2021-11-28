'use strict'

const fp = require('fastify-plugin')
const readFile = require('fs').readFile
const accessSync = require('fs').accessSync
const existsSync = require('fs').existsSync
const mkdirSync = require('fs').mkdirSync
const readdirSync = require('fs').readdirSync
const resolve = require('path').resolve
const join = require('path').join
const { basename, dirname, extname } = require('path')
const HLRU = require('hashlru')
const { getRenderer } = require('./renderers')
const supportedEngines = ['ejs', 'nunjucks', 'pug', 'handlebars', 'marko', 'mustache', 'art-template', 'twig', 'liquid', 'dot', 'eta']

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
  const options = opts.options || {}
  const templatesDir = opts.root || resolve(opts.templates || './')
  const lru = HLRU(opts.maxCache || 100)
  const includeViewExtension = opts.includeViewExtension || false
  const viewExt = opts.viewExt || ''
  const prod = typeof opts.production === 'boolean'
    ? opts.production
    : process.env.NODE_ENV === 'production'
  const defaultCtx = opts.defaultContext || {}
  const layoutFileName = opts.layout

  if (layoutFileName && type !== 'dot' && type !== 'handlebars' && type !== 'ejs' && type !== 'eta') {
    next(new Error('Only Dot, Handlebars, EJS, and Eta support the "layout" option'))
    return
  }

  if (layoutFileName && !hasAccessToLayoutFile(layoutFileName, getDefaultExtension(type))) {
    next(new Error(`unable to access template "${layoutFileName}"`))
    return
  }

  const dotRender = type === 'dot'
    ? viewDot => viewDot.call(fastify, preProcessDot.call(fastify, templatesDir, options))
    : () => {}

  const renderer = getRenderer(type, {
    lru,
    dotRender,
    getPartials,
    getTemplate,
    getPage,
    readFile,
    templatesDir,
    readCallback,
  })

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

  // Gets template as string (or precompiled for Handlebars)
  // from LRU cache or filesystem.
  function getTemplate (file, callback) {
    const data = lru.get(file)
    if (data && prod) {
      callback(null, data)
    } else {
      readFile(join(templatesDir, file), 'utf-8', (err, data) => {
        if (err) {
          callback(err, null)
          return
        }
        if (options.useHtmlMinifier && (typeof options.useHtmlMinifier.minify === 'function')) {
          data = options.useHtmlMinifier.minify(data, options.htmlMinifierOptions || {})
        }
        if (type === 'handlebars') {
          data = engine.compile(data)
        }
        lru.set(file, data)
        callback(null, data)
      })
    }
  }


  // Gets partials as collection of strings from LRU cache or filesystem.
  function getPartials (page, partials, callback) {
    const partialsObj = lru.get(`${page}-Partials`)

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
          if (options.useHtmlMinifier && (typeof options.useHtmlMinifier.minify === 'function')) {
            data = options.useHtmlMinifier.minify(data, options.htmlMinifierOptions || {})
          }

          partialsHtml[key] = data
          if (--filesToLoad === 0) {
            lru.set(`${page}-Partials`, partialsHtml)
            callback(error, partialsHtml)
          }
        })
      })
    }
  }

  function readCallback (that, page, data) {
    return function _readCallback (err, html) {
      if (err) {
        that.send(err)
        return
      }

      let compiledPage
      try {
        if ((type === 'ejs') && viewExt && !options.includer) {
          options.includer = (originalPath, parsedPath) => {
            return {
              filename: parsedPath || join(templatesDir, originalPath + '.' + viewExt)
            }
          }
        }
        options.filename = join(templatesDir, page)
        compiledPage = engine.compile(html, options)
      } catch (error) {
        that.send(error)
        return
      }
      lru.set(page, compiledPage)

      if (!that.getHeader('content-type')) {
        that.header('Content-Type', 'text/html; charset=' + charset)
      }
      let cachedPage
      try {
        cachedPage = lru.get(page)(data)
      } catch (error) {
        cachedPage = error
      }
      if (options.useHtmlMinifier && (typeof options.useHtmlMinifier.minify === 'function')) {
        cachedPage = options.useHtmlMinifier.minify(cachedPage, options.htmlMinifierOptions || {})
      }
      that.send(cachedPage)
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

  // function viewArtTemplate (page, data) {
  // function viewNunjucks (page, data) {
  // function viewMarko (page, data, opts) {
  // function viewHandlebars (page, data) {
  // function viewMustache (page, data, opts) {
  // function viewTwig (page, data, opts) {
  // function viewLiquid (page, data, opts) {
  // function viewDot (renderModule) {

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
  fastify: '3.x',
  name: 'point-of-view'
})
