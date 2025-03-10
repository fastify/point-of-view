'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fs = require('node:fs')

require('./helper').pugHtmlMinifierTests(true)
require('./helper').pugHtmlMinifierTests(false)

test('reply.view with pug engine', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with pug engine in production mode should use cache', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const POV = require('..')

  fastify.decorate(POV.fastifyViewCache, {
    get: () => {
      return () => '<div>Cached Response</div>'
    },
    set: () => { }
  })

  fastify.register(POV, {
    engine: {
      pug
    },
    production: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('<div>Cached Response</div>', responseContent)

  await fastify.close()
})

test('reply.view with pug engine and includes', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/sample.pug', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.renderFile('./templates/sample.pug', data), responseContent)

  await fastify.close()
})

test('reply.view for pug without data-parameter but defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for pug without data-parameter and without defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8')), responseContent)

  await fastify.close()
})

test('reply.view with pug engine and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug', {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for pug engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for pug engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for pug engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for pug engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with pug engine, will preserve content-type', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/xml')
    reply.view('./templates/index.pug', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/xml')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

  await fastify.close()
})

test('fastify.view with pug engine, should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug
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

test('reply.view with pug engine, should throw error if non existent template path', async t => {
  t.plan(3)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    templates: 'non-existent'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./test/index.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')

  await fastify.close()
})

test('reply.view with pug engine should return 500 if compile fails', async t => {
  t.plan(2)
  const fastify = Fastify()
  const pug = {
    compile: () => { throw Error('Compile Error') }
  }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(JSON.parse(responseContent).message, 'Compile Error')

  await fastify.close()
})

test('reply.view with pug engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.pug', 'utf8') }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with pug engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view(pug.compile(fs.readFileSync('./templates/index.pug', 'utf8')), data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

  await fastify.close()
})
