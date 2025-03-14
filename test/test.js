'use strict'

const os = require('node:os')
const { test } = require('node:test')
const path = require('node:path')
const fs = require('node:fs')
const Fastify = require('fastify')

test('fastify.view exist', async t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  await fastify.ready()

  t.assert.ok(fastify.view)

  await fastify.close()
})

test('fastify.view.clearCache exist', async t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  await fastify.ready()

  t.assert.ok(fastify.view.clearCache)

  await fastify.close()
})

test('fastify.view.clearCache clears cache', async t => {
  t.plan(9)
  const templatesFolder = path.join(os.tmpdir(), 'fastify')
  try {
    fs.mkdirSync(templatesFolder)
  } catch {}
  fs.writeFileSync(path.join(templatesFolder, 'cache_clear_test.ejs'), '<html><body><span>123</span></body></<html>', { mode: 0o600 })
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    },
    includeViewExtension: true,
    templates: templatesFolder,
    production: true
  })

  fastify.get('/view-cache-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('cache_clear_test')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/view-cache-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  fs.writeFileSync(path.join(templatesFolder, 'cache_clear_test.ejs'), '<html><body><span>456</span></body></<html>', { mode: 0o600 })

  const result2 = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/view-cache-test')

  const responseContent2 = await result2.text()

  t.assert.strictEqual(result2.headers.get('content-length'), '' + responseContent2.length)
  t.assert.strictEqual(result2.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(responseContent, responseContent2)

  fastify.view.clearCache()

  const result3 = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/view-cache-test')

  const responseContent3 = await result3.text()

  t.assert.strictEqual(result3.headers.get('content-length'), '' + responseContent3.length)
  t.assert.strictEqual(result3.headers.get('content-type'), 'text/html; charset=utf-8')

  t.assert.notStrictEqual(responseContent, responseContent3)
  t.assert.ok(responseContent3.includes('456'))

  await fastify.close()
})

test('reply.view exist', async t => {
  t.plan(4)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.get('/', (_req, reply) => {
    t.assert.ok(reply.view)
    reply.send({ hello: 'world' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(JSON.parse(responseContent), { hello: 'world' })

  await fastify.close()
})

test('reply.locals exist', async t => {
  t.plan(4)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.get('/', (_req, reply) => {
    t.assert.ok(reply.locals)
    reply.send({ hello: 'world' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.deepStrictEqual(JSON.parse(responseContent), { hello: 'world' })

  await fastify.close()
})

test('reply.view can be returned from async function to indicate response processing finished', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates'),
    layout: 'layout.html'
  })

  fastify.get('/', async (_req, reply) => {
    return reply.view('index-for-layout.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('Possibility to access res.locals variable across all views', async t => {
  t.plan(4)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    },
    root: path.join(__dirname, '../templates'),
    layout: 'index-layout-body',
    viewExt: 'ejs'
  })

  fastify.addHook('preHandler', async function (_req, reply) {
    reply.locals = {
      content: 'ok'
    }
  })

  fastify.get('/', async (_req, reply) => {
    return reply.view('index-layout-content')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('ok', responseContent.trim())

  await fastify.close()
})

test('Default extension for ejs', async t => {
  t.plan(4)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    },
    root: path.join(__dirname, '../templates'),
    viewExt: 'html'
  })

  fastify.get('/', async (_req, reply) => {
    return reply.view('index-with-includes-without-ext')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('ok', responseContent.trim())

  await fastify.close()
})

test('reply.view with ejs engine and custom propertyName', async t => {
  t.plan(8)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates'),
    layout: 'layout.html',
    propertyName: 'mobile'
  })
  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates'),
    layout: 'layout.html',
    propertyName: 'desktop'
  })

  fastify.get('/', async (req, reply) => {
    const text = req.headers['user-agent']
    return reply[text]('index-for-layout.ejs', { text })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port, {
    headers: {
      'user-agent': 'mobile'
    }
  })
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), { text: 'mobile' }), responseContent)

  const result2 = await fetch('http://127.0.0.1:' + fastify.server.address().port, {
    headers: {
      'user-agent': 'desktop'
    }
  })
  const responseContent2 = await result2.text()

  t.assert.strictEqual(result2.status, 200)
  t.assert.strictEqual(result2.headers.get('content-length'), '' + responseContent2.length)
  t.assert.strictEqual(result2.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), { text: 'desktop' }), responseContent2)

  await fastify.close()
})

test('reply.view should return 500 if page is missing', async t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view()
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.view should return 500 if layout is set globally and provided on render', async t => {
  t.plan(1)
  const fastify = Fastify()
  const data = { text: 'text' }
  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs'),
      layout: 'layout.html'
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.ejs', data, { layout: 'layout.html' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('register callback should throw if the engine is missing', async t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(require('../index'))

  await t.assert.rejects(fastify.ready(), undefined, 'Missing engine')
})

test('register callback should throw if the engine is not supported', async t => {
  t.plan(1)
  const fastify = Fastify()

  const register = fastify.register(require('../index'), {
    engine: {
      notSupported: null
    }
  })

  await t.assert.rejects(register.ready(), undefined, '\'notSupported\' not yet supported, PR? :)')
})

test('register callback with handlebars engine should throw if layout file does not exist', async t => {
  t.plan(1)
  const fastify = Fastify()

  const register = fastify.register(require('../index'), {
    engine: {
      handlebars: require('handlebars')
    },
    layout: './templates/does-not-exist.hbs'
  })

  await t.assert.rejects(register.ready(), undefined, 'unable to access template "./templates/does-not-exist.hbs"')
})

test('register callback should throw if layout option provided with wrong engine', async t => {
  t.plan(1)
  const fastify = Fastify()

  const register = fastify.register(require('../index'), {
    engine: {
      pug: require('pug')
    },
    layout: 'template'
  })

  await t.assert.rejects(register.ready(), undefined, 'Only Dot, Handlebars, EJS, and Eta support the "layout" option')
})

test('register callback should throw if templates option provided as array with wrong engine', async t => {
  t.plan(1)
  const fastify = Fastify()

  const register = fastify.register(require('../index'), {
    engine: {
      pug: require('pug')
    },
    templates: ['layouts', 'pages']
  })

  await t.assert.rejects(register.ready(), undefined, 'Only Nunjucks supports the "templates" option as an array')
})

test('plugin is registered with "point-of-view" name', async t => {
  t.plan(1)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  await fastify.ready()

  const kRegistedPlugins = Symbol.for('registered-plugin')
  const registeredPlugins = fastify[kRegistedPlugins]
  t.assert.ok(registeredPlugins.find(name => name === '@fastify/view'))

  await fastify.close()
})
