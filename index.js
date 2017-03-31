'use strict'

const fp = require('fastify-plugin')
const fs = require('fs')
const path = require('path')
const HLRU = require('hashlru')
const supportedEngines = ['ejs', 'pug', 'handlebars']

function fastifyView (fastify, opts, next) {
  fastify.decorateReply('view', view)

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
  const templatesDir = path.join(process.cwd(), opts.templates || './')
  const lru = HLRU(opts.maxCache || 100)
  const prod = process.env.NODE_ENV === 'production'

  function view (page, data) {
    if (!page || !data) {
      this.send(new Error('Missing data'))
      return
    }

    const toHtml = lru.get(page)

    if (toHtml && prod) {
      this.header('Content-Type', 'text/html').send(toHtml(data))
      return
    }

    fs.readFile(path.join(templatesDir, page), 'utf8', readCallback(this, page, data))
  }

  function readCallback (that, page, data) {
    return function _readCallback (err, html) {
      if (err) {
        that.send(err)
        return
      }

      lru.set(page, engine.compile(html, options))
      that.header('Content-Type', 'text/html').send(lru.get(page)(data))
    }
  }

  next()
}

module.exports = fp(fastifyView, '>=0.13.1')
