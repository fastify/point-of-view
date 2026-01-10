'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fs = require('node:fs')
const path = require('node:path')
const Sqrl = require('squirrelly')

const pointOfView = require('../index')

require('./helper').squirrellyHtmlMinifierTests(true)
require('./helper').squirrellyHtmlMinifierTests(false)

test('reply.view with squirrelly engine and custom templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.squirrelly', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and root option', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.squirrelly', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and custom ext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates',
    viewExt: 'squirrelly'
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
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: '<p>{{it.text}}</p>' }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('<p>text</p>', responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    }
  })

  const templateFn = (data) => `<p>${data.text}</p>`

  fastify.get('/', (_req, reply) => {
    reply.view(templateFn, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('<p>text</p>', responseContent)

  await fastify.close()
})

test('reply.viewAsync with squirrelly engine', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates'
  })

  fastify.get('/', async (_req, reply) => {
    return reply.viewAsync('index.squirrelly', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('fastify.view with squirrelly engine', async t => {
  t.plan(2)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates'
  })

  await fastify.ready()

  const result = await fastify.view('index.squirrelly', data)
  const expected = Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data)

  t.assert.ok(typeof result === 'string')
  t.assert.strictEqual(result, expected)

  await fastify.close()
})

test('reply.view with squirrelly engine and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates',
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.squirrelly')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and locals', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates'
  })

  fastify.addHook('preHandler', function (_req, reply, done) {
    reply.locals = data
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.squirrelly')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and custom property name', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates',
    propertyName: 'render'
  })

  fastify.get('/', (_req, reply) => {
    reply.render('index.squirrelly', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view should return 500 if template not found', async t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('non-existing.squirrelly', { text: 'text' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})
