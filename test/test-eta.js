'use strict'

const { test, beforeEach } = require('node:test')
const Fastify = require('fastify')
const fs = require('node:fs')
const path = require('node:path')

const pointOfView = require('../index')
const { Eta } = require('eta')
let eta = new Eta()

require('./helper').etaHtmlMinifierTests(true)
require('./helper').etaHtmlMinifierTests(false)

beforeEach(async () => {
  // this is mandatory since some test call eta.configure(customOptions)
  eta = new Eta()
})

test('reply.view with eta engine and custom templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.eta', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with eta engine with layout option', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    root: path.join(__dirname, '../templates'),
    layout: 'layout-eta.html'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.eta', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with eta engine with layout option on render', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.eta', data, { layout: 'layout-eta.html' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view should return 500 if layout is missing on render', async t => {
  t.plan(1)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.eta', data, { layout: 'non-existing-layout-eta.html' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.view with eta engine and custom ext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: 'templates',
    viewExt: 'eta'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for eta without data-parameter but defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.eta')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for eta without data-parameter but defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.eta')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for eta without data-parameter and without defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-bare.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index-bare.html', 'utf8')), responseContent)

  await fastify.close()
})

test('reply.view for eta engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }

  fastify.register(pointOfView, {
    engine: {
      eta
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for eta engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for eta engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for eta engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with eta engine and full path templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.eta', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with eta engine', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.eta', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with eta engine and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.eta', {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with eta engine and includeViewExtension property as true', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    includeViewExtension: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with eta engine, template folder specified, include files (eta and html) used in template, includeViewExtension property as true', async t => {
  t.plan(5)
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

  fastify.get('/', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-linking-other-pages', data) // sample for specifying with type
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  const content = eta.render('/index-linking-other-pages.eta', data, options)
  t.assert.strictEqual(content.length, responseContent.length)
  t.assert.strictEqual(content, responseContent)

  await fastify.close()
})

test('reply.view with eta engine, templates with folder specified, include files and attributes; home', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  const content = eta.render('/index.eta', data, options)
  t.assert.strictEqual(content.length, responseContent.length)

  await fastify.close()
})

test('reply.view with eta engine, templates with folder specified, include files and attributes; page with no data', async t => {
  t.plan(4)
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

  fastify.get('/no-data-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-no-data')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/no-data-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  const content = eta.render('/index-with-no-data.eta', null, options)
  t.assert.strictEqual(content.length, responseContent.length)

  await fastify.close()
})

test('reply.view with eta engine, templates with folder specified, include files and attributes; page with includes', async t => {
  t.plan(4)
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

  fastify.get('/include-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/include-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  const content = eta.render('/index-with-includes.eta', data, options)
  t.assert.strictEqual(content.length, responseContent.length)

  await fastify.close()
})

test('reply.view with eta engine, templates with folder specified, include files and attributes; page with one include missing', async t => {
  t.plan(4)
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

  fastify.get('/include-one-include-missing-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-one-missing', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/include-one-include-missing-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  await t.assert.rejects(eta.renderAsync('/index-with-includes-one-missing.eta', data, options))

  await fastify.close()
})

test('fastify.view with eta engine and callback in production mode', (t, end) => {
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
    t.assert.ifError(err)

    fastify.view('templates/index.eta', data, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), compiled)

      fastify.ready(err => {
        t.assert.ifError(err)

        fastify.view('templates/index.eta', data, (err, compiled) => {
          t.assert.ifError(err)
          t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), compiled)
          fastify.close()
          end()
        })
      })
    })
  })
})

test('fastify.view with eta engine in production mode should use cache', async t => {
  t.plan(1)

  const fastify = Fastify()
  const cache = {
    cache: {},
    get (k) {
      if (this.cache[k] !== undefined) {
        t.assert.ok(true)
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
      templatesSync: cache
    }
  })

  await fastify.ready()

  await fastify.view('templates/index.eta', { text: 'test' })
  await fastify.view('templates/index.eta', { text: 'test' }) // This should trigger the cache
  await fastify.close()
})

test('fastify.view with eta engine and custom cache', async t => {
  t.plan(6)
  const fastify = Fastify()

  const tplPath = 'templates/index.eta'
  const tplAbsPath = path.resolve(tplPath)
  const data = { text: 'text' }

  // Custom cache
  const pseudoCache = {
    cache: {},
    get: function (k) {
      t.assert.ok('the cache is set')
      return this.cache[k]
    },
    define: function (k, v) {
      this.cache[k] = v
    }
  }

  const etaOptions = {
    cache: true,
    templatesSync: pseudoCache,
    views: path.join(__dirname, '../templates')
  }

  eta.configure(etaOptions)

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    options: etaOptions
  })

  // pre-cache
  eta.loadTemplate(path.join(__dirname, tplPath), eta.readFile(tplPath))
  const tplF = eta.templatesSync.get(path.join(__dirname, tplPath))

  fastify.get('/', (_req, reply) => {
    try {
      const res = reply.view(tplPath, data)
      t.assert.strictEqual(eta.templatesSync, pseudoCache,
        'Cache instance should be equal to the pre-defined one')
      t.assert.notStrictEqual(eta.templatesSync.get(tplAbsPath), undefined,
        'Template should be pre-cached')
      return res
    } catch (e) {
      t.assert.ifError(e)
    }
  })

  await fastify.listen()

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200, 'Response should be 200')

  const str = eta.render(tplF, data)
  t.assert.strictEqual(str, responseContent, 'Route should return the same result as cached template function')

  await fastify.close()
})

test('fastify.view with eta engine, should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      eta
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view(null, {}, err => {
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(err.message, 'Missing page')
      fastify.close()
      end()
    })
  })
})

test('fastify.view with eta engine and async in production mode', (t, end) => {
  t.plan(3)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    production: true,
    options: {
      async: true
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('templates/index.eta', data).then((compiled) => {
      t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), compiled)
      fastify.view('templates/index.eta', null)
        .then(() => { t.fail('should not be here') })
        .catch((err) => {
          t.assert.ok(err instanceof Error)
          fastify.close()
          end()
        })
    })
  })
})

test('reply.view with eta engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.eta', 'utf8') }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with eta engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view(eta.compile(fs.readFileSync('./templates/index.eta', 'utf8')), data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view should return 500 if function return sync error', async t => {
  t.plan(1)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view(() => { throw new Error('kaboom') }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.view should return 500 if function return async error', async t => {
  t.plan(1)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      eta
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view(() => Promise.reject(new Error('kaboom')), data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})
