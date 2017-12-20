'use strict'

const fp = require('fastify-plugin')
const readFile = require('fs').readFile
const resolve = require('path').resolve
const join = require('path').join
const HLRU = require('hashlru')
const supportedEngines = ['ejs', 'nunjucks', 'pug', 'handlebars', 'marko', 'ejs-mate']

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

  const engine = opts.engine[type]
  const options = opts.options || {}
  const templatesDir = resolve(opts.templates || './')
  const lru = HLRU(opts.maxCache || 100)
  const includeViewExtension = opts.includeViewExtension || false
  const prod = process.env.NODE_ENV === 'production'
  const renders = {
    marko: viewMarko,
    'ejs-mate': viewEjsMate,
    handlebars: viewHandlebars,
    nunjucks: viewNunjucks,
    _default: view
  }

  fastify.decorateReply('view', renders[type] ? renders[type] : renders._default)

  function getPage (page, extension) {
    if (includeViewExtension) {
      return `${page}.${extension}`
    }
    return page
  }

  function readCallback (that, page, data) {
    return function _readCallback (err, html) {
      if (err) {
        that.send(err)
        return
      }

      lru.set(page, engine.compile(html, options))

      if (!that.res.getHeader('content-type')) {
        that.header('Content-Type', 'text/html')
      }
      that.send(lru.get(page)(data))
    }
  }

  function view (page, data) {
    if (!page || !data) {
      this.send(new Error('Missing data'))
      return
    }

    // append view extension
    page = getPage(page, type)

    const toHtml = lru.get(page)

    if (toHtml && prod) {
      if (!this.res.getHeader('content-type')) {
        this.header('Content-Type', 'text/html')
      }
      this.send(toHtml(data))
      return
    }

    readFile(join(templatesDir, page), 'utf8', readCallback(this, page, data))
  }

  function viewEjsMate (page, data) {
    if (!page || !data) {
      this.send(new Error('Missing data'))
      return
    }
    const confs = Object.assign({}, options)
    if (!confs.settings) {
      confs.settings = {}
    }
    // ejs-mate use views to find layouts
    confs.settings.views = templatesDir
    // setting locals to pass data by
    confs.locals = Object.assign({}, confs.locals, data)
    // append view extension
    page = getPage(page, 'ejs')
    engine(join(templatesDir, page), confs, (err, html) => {
      if (err) return this.send(err)
      this.header('Content-Type', 'text/html').send(html)
    })
  }

  function viewNunjucks (page, data) {
    if (!page || !data) {
      this.send(new Error('Missing data'))
      return
    }
    // Create nunjucks environment with custom options.
    // Do not pass templatesDir to nunjucks.configure(),
    // otherwise all nunjucks function will take templatesDir as their
    // path, and will cause error in test.
    const env = engine.configure(options)
    // append view extension
    page = getPage(page, 'njk')
    // Use path.join() to dealing with path like '/index.njk'.
    // This will let it find the correct template path.
    env.render(join(templatesDir, page), data, (err, html) => {
      if (err) return this.send(err)
      this.header('Content-Type', 'text/html').send(html)
    })
  }

  function viewMarko (page, data, opts) {
    if (!page || !data) {
      this.send(new Error('Missing data'))
      return
    }

    // append view extension
    page = getPage(page, type)

    const template = engine.load(join(templatesDir, page))

    if (opts && opts.stream) {
      this.send(template.stream(data))
    } else {
      template.renderToString(data, send(this))
    }

    function send (that) {
      return function _send (err, html) {
        if (err) return that.send(err)
        that.header('Content-Type', 'text/html').send(html)
      }
    }
  }

  function viewHandlebars (page, data) {
    if (!page || !data) {
      this.send(new Error('Missing data'))
      return
    }

    const toHtml = lru.get(page)

    if (toHtml && prod) {
      if (!this.res.getHeader('content-type')) {
        this.header('Content-Type', 'text/html')
      }
      this.send(toHtml(data))
      return
    }

    readFile(join(templatesDir, page), 'utf8', readCallback(this, page, data))
  }

  next()
}

module.exports = fp(fastifyView, { fastify: '>=0.13.1' })
