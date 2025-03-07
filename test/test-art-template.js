'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fs = require('node:fs')
const path = require('node:path')

test('reply.view with art-template engine and custom templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./index.art', data)
  })

  await fastify.listen({ port: 10086 })

  const result = await fetch('http://127.0.0.1:10086/')

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view with art-template engine and explicit root folder', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    root: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./index.art', data)
  })

  await fastify.listen({ port: 10086 })

  const result = await fetch('http://127.0.0.1:10086/')

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view for art-template without data-parameter and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./index.art')
  })

  await fastify.listen({ port: 10086 })

  const result = await fetch('http://127.0.0.1:10086/')

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, {}), responseContent)

  await fastify.close()
})

test('reply.view for art-template without data-parameter but with defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./index.art')
  })

  await fastify.listen({ port: 10086 })

  const result = await fetch('http://127.0.0.1:10086/')

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view with art-template engine and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates',
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./index.art', {})
  })

  await fastify.listen({ port: 10086 })

  const result = await fetch('http://127.0.0.1:10086/')

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view for art-template engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.art')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, localsData), responseContent)

  await fastify.close()
})

test('reply.view for art-template engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.art', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view for art-template engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.art')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, localsData), responseContent)

  await fastify.close()
})

test('reply.view for art-template engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.art', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view with art-template engine and full path templates folder', async t => {
  t.plan(4)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: path.join(__dirname, '..', 'templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./index.art', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view with art-template engine and includeViewExtension is true', async t => {
  t.plan(4)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    includeViewExtension: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('fastify.view with art-template engine and full path templates folder', async t => {
  t.plan(4)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: path.join(__dirname, '..', 'templates')
  })

  fastify.get('/', (_req, reply) => {
    fastify.view('./index', data, (err, html) => {
      t.assert.ifError(err)
      reply.send(html)
    })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/plain; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('fastify.view with art-template should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const art = require('art-template')

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view(null, {}, err => {
      t.assert.ok(err instanceof Error)
      t.assert.deepStrictEqual(err.message, 'Missing page')
      fastify.close()
      end()
    })
  })
})

test('reply.view with art-template should return 500 if render fails', async t => {
  t.plan(2)
  const fastify = Fastify()
  const art = {
    compile: () => { throw Error('Compile Error') }
  }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.deepStrictEqual(result.status, 500)
  t.assert.deepStrictEqual('Compile Error', (await result.json()).message)

  await fastify.close()
})

test('reply.view with art-template engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.art') }, data)
  })

  await fastify.listen({ port: 10086 })

  const result = await fetch('http://127.0.0.1:10086/')

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view with art-template engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/html').view(art.compile({ filename: path.join(__dirname, '..', 'templates', 'index.art') }), data)
  })

  await fastify.listen({ port: 10086 })

  const result = await fetch('http://127.0.0.1:10086/')

  const responseContent = await result.text()

  t.assert.deepStrictEqual(result.status, 200)
  t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html')

  const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

  t.assert.deepStrictEqual(art(templatePath, data), responseContent)

  await fastify.close()
})

test('reply.view with art-template engine and unknown template type', async t => {
  t.plan(1)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view({}, data)
  })

  await fastify.listen({ port: 10086 })

  const result = await fetch('http://127.0.0.1:10086/')

  t.assert.deepStrictEqual(result.status, 500)

  await fastify.close()
})
