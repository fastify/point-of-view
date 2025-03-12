'use strict'

const { test } = require('node:test')
const fs = require('node:fs')
const Fastify = require('fastify')

require('./helper').liquidHtmlMinifierTests(true)
require('./helper').liquidHtmlMinifierTests(false)

test('reply.view with liquid engine', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.liquid', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view with liquid engine without data-parameter but defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.liquid')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view with liquid engine without data-parameter but without defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.liquid')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid')
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view with liquid engine with data-parameter and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.liquid', {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view for liquid engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const localsData = { text: 'text from locals' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.liquid', {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid', localsData)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view for liquid engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.liquid', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view for liquid engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const localsData = { text: 'text from locals' }
  const defaultContext = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    },
    defaultContext
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.liquid')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid', localsData)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view for liquid engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const localsData = { text: 'text from locals' }
  const defaultContext = { text: 'text from context' }
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    },
    defaultContext
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.liquid', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view with liquid engine and custom tag', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  engine.registerTag('header', {
    parse: function (token) {
      const [key, val] = token.args.split(':')
      this[key] = val
    },
    render: async function (scope, emitter) {
      const title = await this.liquid.evalValue(this.content, scope)
      emitter.write(`<h1>${title}</h1>`)
    }
  })

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-with-custom-tag.liquid', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index-with-custom-tag.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view with liquid engine and double quoted variable', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'foo' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/double-quotes-variable.liquid', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/double-quotes-variable.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('fastify.view with liquid engine, should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
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

test('fastify.view with liquid engine template that does not exist errors correctly', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./I-Dont-Exist', {}, err => {
      t.assert.ok(err instanceof Error)
      t.assert.match(err.message, /ENOENT/)
      fastify.close()
      end()
    })
  })
})

test('reply.view with liquid engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.liquid', 'utf8') }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.renderFile('./templates/index.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view with liquid engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/html').view(engine.renderFile.bind(engine, './templates/index.liquid'), data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html')

  const html = await engine.renderFile('./templates/index.liquid', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})

test('reply.view with liquid engine and unknown template type', async t => {
  t.plan(1)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})
