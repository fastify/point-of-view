'use strict'

const { test } = require('node:test')
const fs = require('node:fs')
const Fastify = require('fastify')
const path = require('node:path')

require('./helper').nunjucksHtmlMinifierTests(true)
require('./helper').nunjucksHtmlMinifierTests(false)

test('reply.view with nunjucks engine and custom templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.njk', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view with nunjucks engine and custom templates array of folders', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    templates: [
      'templates/nunjucks-layout',
      'templates/nunjucks-template'
    ]
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.njk', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view for nunjucks engine without data-parameter but defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.njk')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('./templates/index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view for nunjucks engine without data-parameter and without defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.njk')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('./templates/index.njk'), responseContent)

  await fastify.close()
})

test('reply.view for nunjucks engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.njk')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('./templates/index.njk', localsData), responseContent)

  await fastify.close()
})

test('reply.view for nunjucks engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.njk', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('./templates/index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view for nunjucks engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.njk')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('./templates/index.njk', localsData), responseContent)

  await fastify.close()
})

test('reply.view for nunjucks engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.njk', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('./templates/index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view with nunjucks engine, will preserve content-type', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/xml')
    reply.view('./templates/index.njk', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/xml')
  t.assert.strictEqual(nunjucks.render('./templates/index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view with nunjucks engine and full path templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    templates: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./index.njk', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  // Global Nunjucks templates dir changed here.
  t.assert.strictEqual(nunjucks.render('./index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view with nunjucks engine and includeViewExtension is true', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    includeViewExtension: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  // Global Nunjucks templates dir is  `./` here.
  t.assert.strictEqual(nunjucks.render('./templates/index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view with nunjucks engine using onConfigure callback', async t => {
  t.plan(5)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    options: {
      onConfigure: env => {
        env.addGlobal('myGlobalVar', 'my global var value')
      }
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-with-global.njk', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  // Global Nunjucks templates dir is  `./` here.
  t.assert.strictEqual(nunjucks.render('./templates/index-with-global.njk', data), responseContent)
  t.assert.match(responseContent, /.*<p>my global var value<\/p>/)

  await fastify.close()
})

test('fastify.view with nunjucks engine', (t, end) => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('templates/index.njk', data, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(nunjucks.render('./templates/index.njk', data), compiled)

      fastify.ready(err => {
        t.assert.ifError(err)

        fastify.view('templates/index.njk', data, (err, compiled) => {
          t.assert.ifError(err)
          t.assert.strictEqual(nunjucks.render('./templates/index.njk', data), compiled)
          fastify.close()
          end()
        })
      })
    })
  })
})

test('fastify.view with nunjucks should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')

  fastify.register(require('../index'), {
    engine: {
      nunjucks
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

test('fastify.view with nunjucks engine should return 500 if render fails', async t => {
  t.plan(2)
  const fastify = Fastify()
  const nunjucks = {
    configure: () => ({
      render: (_, __, callback) => { callback(Error('Render Error')) }
    })
  }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.njk')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(JSON.parse(responseContent).message, 'Render Error')

  await fastify.close()
})

test('reply.view with nunjucks engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.njk') }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view with nunjucks engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view(nunjucks.compile(fs.readFileSync('./templates/index.njk').toString()), data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(nunjucks.render('index.njk', data), responseContent)

  await fastify.close()
})

test('reply.view with nunjucks engine and unknown template type', async t => {
  t.plan(1)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})
