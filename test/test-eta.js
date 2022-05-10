'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('fs')
const path = require('path')

const pointOfView = require('../index')
const eta = require('eta')

require('./helper').etaHtmlMinifierTests(t, true)
require('./helper').etaHtmlMinifierTests(t, false)

test('reply.view with eta engine and custom templates folder', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.eta', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with eta engine with layout option', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    root: path.join(__dirname, '../templates'),
    layout: 'layout-eta.html'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.eta', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with eta engine with layout option on render', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.eta', data, { layout: 'layout-eta.html' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view should return 500 if layout is missing on render', t => {
  t.plan(3)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.eta', data, { layout: 'non-existing-layout-eta.html' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      fastify.close()
    })
  })
})

test('reply.view with eta engine and custom ext', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: 'templates',
    viewExt: 'eta'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for eta without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.eta')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for eta without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.eta')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for eta without data-parameter and without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-bare.html')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index-bare.html', 'utf8')), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for eta engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }

  fastify.register(pointOfView, {
    engine: {
      eta
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-bare.html')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for eta engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-bare.html', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for eta engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-bare.html')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for eta engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-bare.html', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with eta engine and full path templates folder', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.eta', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with eta engine', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('templates/index.eta', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with eta engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('templates/index.eta', {})
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with eta engine and includeViewExtension property as true', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('templates/index', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with eta engine, template folder specified, include files (eta and html) used in template, includeViewExtension property as true', t => {
  t.plan(7)
  const fastify = Fastify()

  const templatesFolder = path.join(__dirname, '../templates')
  const options = {
    views: templatesFolder // must be put to make tests (with include files) working ...
  }
  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-linking-other-pages', data) // sample for specifying with type
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      eta.renderFile('/index-linking-other-pages.eta', data, options, function (err, str) {
        content = str
        t.error(err)
        t.equal(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with eta engine, templates with folder specified, include files and attributes; home', t => {
  t.plan(7)
  const fastify = Fastify()

  const templatesFolder = path.join(__dirname, '../templates')
  const options = {
    views: templatesFolder
  }
  const data = { text: 'Hello from eta Templates' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      eta.renderFile(
        '/index.eta',
        data,
        options,
        function (err, str) {
          content = str
          t.error(err)
          t.equal(content.length, body.length)
        }
      )

      fastify.close()
    })
  })
})

test('reply.view with eta engine, templates with folder specified, include files and attributes; page with no data', t => {
  t.plan(7)
  const fastify = Fastify()

  const templatesFolder = path.join(__dirname, '../templates')
  const options = {
    views: templatesFolder
  }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/no-data-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-no-data')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/no-data-test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      eta.renderFile(
        '/index-with-no-data.eta',
        null,
        options,
        function (err, str) {
          content = str
          t.error(err)
          t.equal(content.length, body.length)
        }
      )

      fastify.close()
    })
  })
})

test('reply.view with eta engine, templates with folder specified, include files and attributes; page with includes', t => {
  t.plan(7)
  const fastify = Fastify()

  const templatesFolder = path.join(__dirname, '../templates')
  const options = {
    views: templatesFolder
  }

  const data = { text: 'Hello from eta Templates' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/include-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      eta.renderFile(
        '/index-with-includes.eta',
        data,
        options,
        function (err, str) {
          content = str
          t.error(err)
          t.equal(content.length, body.length)
        }
      )

      fastify.close()
    })
  })
})

test('reply.view with eta engine, templates with folder specified, include files and attributes; page with one include missing', t => {
  t.plan(7)
  const fastify = Fastify()

  const templatesFolder = path.join(__dirname, '../templates')
  const options = {
    views: templatesFolder
  }
  const data = { text: 'Hello from eta Templates' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/include-one-include-missing-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-one-missing', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-one-include-missing-test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      eta.renderFile(
        '/index-with-includes-one-missing.eta',
        data,
        options,
        function (err, str) {
          content = str
          t.type(err, Error) // expected Error here ...
          t.equal(content, undefined)
        }
      )

      fastify.close()
    })
  })
})

test('fastify.view with eta engine and callback in production mode', t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    production: true
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('templates/index.eta', data, (err, compiled) => {
      t.error(err)
      t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('templates/index.eta', data, (err, compiled) => {
          t.error(err)
          t.equal(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), compiled)
          fastify.close()
        })
      })
    })
  })
})

test('fastify.view with eta engine in production mode should use cache', t => {
  t.plan(1)

  const fastify = Fastify()
  const cache = {
    cache: {},
    get (k) {
      if (typeof this.cache[k] !== 'undefined') {
        t.pass()
      }
      return this.cache[k]
    },
    define (k, v) {
      this.cache[k] = v
    }
  }

  fastify.register(pointOfView, {
    production: true,
    engine: {
      eta
    },
    options: {
      templates: cache
    }
  })

  fastify.ready(async () => {
    await fastify.view('templates/index.eta', { text: 'test' })
    await fastify.view('templates/index.eta', { text: 'test' }) // This should trigger the cache
    fastify.close()
  })
})

test('fastify.view with eta engine and custom cache', t => {
  t.plan(9)
  const fastify = Fastify()

  const tplPath = 'templates/index.eta'
  const tplAbsPath = path.resolve(tplPath)
  const data = { text: 'text' }

  // Custom cache
  const pseudoCache = {
    cache: {},
    get: function (k) {
      t.pass('the cache is set')
      return this.cache[k]
    },
    define: function (k, v) {
      this.cache[k] = v
    }
  }

  const etaOptions = {
    cache: true,
    templates: pseudoCache
  }

  eta.configure(etaOptions)

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    options: etaOptions
  })

  // pre-cache
  const tplFn = eta.loadFile(tplAbsPath, { filename: tplAbsPath })

  fastify.get('/', (req, reply) => {
    try {
      const res = reply.view(tplPath, data)
      t.equal(eta.config.templates, pseudoCache,
        'Cache instance should be equal to the pre-defined one')
      t.not(eta.config.templates.get(tplAbsPath), undefined,
        'Template should be pre-cached')
      return res
    } catch (e) {
      t.error(e)
    }
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200, 'Response should be 200')
      tplFn(data, eta.config, (err, str) => {
        t.error(err)
        t.equal(str, body.toString(), 'Route should return the same result as cached template function')
      })
      fastify.close()
    })
  })
})

test('fastify.view with eta engine, should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      eta
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view(null, {}, err => {
      t.ok(err instanceof Error)
      t.equal(err.message, 'Missing page')
      fastify.close()
    })
  })
})
