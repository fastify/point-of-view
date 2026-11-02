'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fs = require('node:fs')
const path = require('node:path')
const swig = require('free-swig')

const pointOfView = require('../index')

require('./helper').swigHtmlMinifierTests(true)
require('./helper').swigHtmlMinifierTests(false)

test('reply.view with swig engine and custom templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.swig', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view with swig engine and custom ext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    templates: 'templates',
    viewExt: 'swig'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view for swig without data-parameter but defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.swig')
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view for swig engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }

  fastify.register(pointOfView, {
    engine: {
      swig
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.swig')
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', localsData), responseContent)

  await fastify.close()
})

test('reply.view for swig engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.swig', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view with swig engine and full path templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    templates: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.swig', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view with swig engine', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.swig', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view with swig engine and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.swig', {})
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view with swig engine and includeViewExtension property as true', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    includeViewExtension: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('fastify.view with swig engine and callback in production mode', (t, end) => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    production: true
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('templates/index.swig', data, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), compiled)

      fastify.ready(err => {
        t.assert.ifError(err)

        fastify.view('templates/index.swig', data, (err, compiled) => {
          t.assert.ifError(err)
          t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), compiled)
          fastify.close()
          end()
        })
      })
    })
  })
})

test('fastify.view with swig engine, should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      swig
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

test('reply.view with swig engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.swig', 'utf8') }, data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.render(fs.readFileSync('./templates/index.swig', 'utf8'), { locals: data }), responseContent)

  await fastify.close()
})

test('reply.view with swig engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view((data) => `<p>${data.text}</p>`, data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('<p>text</p>', responseContent)

  await fastify.close()
})

test('reply.view should return 500 if function return sync error', async t => {
  t.plan(1)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view(() => { throw new Error('kaboom') }, data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.view should return 500 if function return async error', async t => {
  t.plan(1)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view(() => Promise.reject(new Error('kaboom')), data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.view should return 500 if template not found', async t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('non-existing.swig', { text: 'text' })
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('fastify.view with swig engine', async t => {
  t.plan(2)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    templates: 'templates'
  })

  await fastify.ready()

  const result = await fastify.view('index.swig', data)
  const expected = swig.renderFile('./templates/index.swig', data)

  t.assert.ok(typeof result === 'string')
  t.assert.strictEqual(result, expected)

  await fastify.close()
})

test('reply.viewAsync with swig engine', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    templates: 'templates'
  })

  fastify.get('/', async (_req, reply) => {
    return reply.viewAsync('index.swig', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view with swig engine and root option', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.swig', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})

test('reply.view with swig engine and custom property name', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      swig
    },
    templates: 'templates',
    propertyName: 'render'
  })

  fastify.get('/', (_req, reply) => {
    reply.render('index.swig', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(swig.renderFile('./templates/index.swig', data), responseContent)

  await fastify.close()
})
