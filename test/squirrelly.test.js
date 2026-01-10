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

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
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

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for squirrelly without data-parameter but defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.squirrelly')
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for squirrelly without data-parameter and without defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-bare.html')
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index-bare.html', 'utf8')), responseContent)

  await fastify.close()
})

test('reply.view for squirrelly engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html')
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for squirrelly engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for squirrelly engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
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

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for squirrelly engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
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

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and full path templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    templates: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.squirrelly', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.squirrelly', data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

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
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.squirrelly', {})
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and includeViewExtension property as true', async t => {
  t.plan(4)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
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
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('fastify.view with squirrelly engine and callback in production mode', (t, end) => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(pointOfView, {
    engine: {
      squirrelly: Sqrl
    },
    production: true
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('templates/index.squirrelly', data, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), compiled)

      fastify.ready(err => {
        t.assert.ifError(err)

        fastify.view('templates/index.squirrelly', data, (err, compiled) => {
          t.assert.ifError(err)
          t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), compiled)
          fastify.close()
          end()
        })
      })
    })
  })
})

test('fastify.view with squirrelly engine, should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      squirrelly: Sqrl
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
    reply.view({ raw: fs.readFileSync('./templates/index.squirrelly', 'utf8') }, data)
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with squirrelly engine and function template', async t => {
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
      squirrelly: Sqrl
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
      squirrelly: Sqrl
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
      squirrelly: Sqrl
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('non-existing.squirrelly', { text: 'text' })
  })

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)

  t.assert.strictEqual(result.status, 500)

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

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
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

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
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

  const address = await fastify.listen({ port: 0 })

  const result = await fetch(address)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(Sqrl.render(fs.readFileSync('./templates/index.squirrelly', 'utf8'), data), responseContent)

  await fastify.close()
})
