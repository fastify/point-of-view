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

  const charset = opts.charset || 'utf-8'
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

  const renderer = renders[type] ? renders[type] : renders._default

  fastify.decorate('view', function () {
    return renderer.apply({
      getHeader: () => {},
      header: () => {}
    }, arguments)
  })

  fastify.decorateReply('view', function () {
    renderer.apply(this, arguments)
      .then(page => {
        this.send(page)
      }).catch(err => {
        this.send(err)
      })
  })

  function getPage (page, extension) {
    if (includeViewExtension) {
      return `${page}.${extension}`
    }
    return page
  }

  function readCallback (that, page, data, resolve, reject) {
    return function _readCallback (err, html) {
      if (err) {
        return reject(err)
      }

      let compiledPage
      try {
        compiledPage = engine.compile(html, options)
      } catch (error) {
        return reject(error)
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
      resolve(cachedPage)
    }
  }

  function view (page, data) {
    return new Promise((resolve, reject) => {
      if (!page) {
        return reject(new Error('Missing page'))
      }

      // append view extension
      page = getPage(page, type)

      const toHtml = lru.get(page)

      if (toHtml && prod) {
        if (!this.res.getHeader('content-type')) {
          this.header('Content-Type', 'text/html; charset=' + charset)
        }
        return resolve(toHtml(data))
      }

      readFile(join(templatesDir, page), 'utf8', readCallback(this, page, data, resolve, reject))
    })
  }

  function viewEjsMate (page, data) {
    return new Promise((resolve, reject) => {
      if (!page || !data) {
        return reject(new Error('Missing data'))
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
        if (err) return reject(err)
        this.header('Content-Type', 'text/html; charset=' + charset)
        resolve(html)
      })
    })
  }

  function viewNunjucks (page, data) {
    return new Promise((resolve, reject) => {
      if (!page || !data) {
        return reject(new Error('Missing data'))
      }
      const env = engine.configure(templatesDir, options)
      // Append view extension.
      page = getPage(page, 'njk')
      env.render(join(templatesDir, page), data, (err, html) => {
        if (err) return reject(err)
        this.header('Content-Type', 'text/html; charset=' + charset)
        resolve(html)
      })
    })
  }

  function viewMarko (page, data, opts) {
    return new Promise((resolve, reject) => {
      if (!page || !data) {
        return reject(new Error('Missing data'))
      }

      // append view extension
      page = getPage(page, type)

      const template = engine.load(join(templatesDir, page))

      if (opts && opts.stream) {
        resolve(template.stream(data))
      } else {
        template.renderToString(data, send(this))
      }

      function send (that) {
        return function _send (err, html) {
          if (err) return reject(err)
          that.header('Content-Type', 'text/html; charset=' + charset)
          resolve(html)
        }
      }
    })
  }

  function viewHandlebars (page, data) {
    return new Promise((resolve, reject) => {
      if (!page || !data) {
        return reject(new Error('Missing data'))
      }

      const toHtml = lru.get(page)

      if (toHtml && prod) {
        if (!this.res.getHeader('content-type')) {
          this.header('Content-Type', 'text/html; charset=' + charset)
        }
        return resolve(toHtml(data))
      }

      readFile(join(templatesDir, page), 'utf8', readCallback(this, page, data, resolve, reject))
    })
  }

  next()
}

module.exports = fp(fastifyView, { fastify: '^1.1.0' })
