'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fs = require('node:fs')
const minifier = require('html-minifier-terser')

test('reply.view with ejs engine and async: true (global option)', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: { async: true },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine, async: true (global option), and production: true', async t => {
  const numTests = 2
  t.plan(numTests * 4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: { async: true },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs')
  })

  await fastify.listen({ port: 0 })

  for (let i = 0; i < numTests; i++) {
    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), responseContent)

    if (i === numTests - 1) await fastify.close()
  }
})

const minifierOpts = { collapseWhitespace: true }
test('reply.view with ejs engine, async: true (global option), and html-minifier-terser', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine, async: true (global option), and html-minifier without option', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: true,
      useHtmlMinifier: minifier
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true })), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine, async: true (global option), and html-minifier in production mode', async t => {
  const numTests = 3
  t.plan(numTests * 4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs')
  })

  await fastify.listen({ port: 0 })

  for (let i = 0; i < numTests; i++) {
    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), responseContent)

    if (i === numTests - 1) await fastify.close()
  }
})

test('reply.view with ejs engine and async: true (local option)', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs', {}, { async: true })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine, async: true (local option), and production: true', async t => {
  const numTests = 5
  t.plan(numTests * 4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs', {}, { async: true })
  })

  await fastify.listen({ port: 0 })

  for (let i = 0; i < numTests; i++) {
    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), responseContent)

    if (i === numTests - 1) await fastify.close()
  }
})

test('reply.view with ejs engine, async: true (local override), and html-minifier-terser', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: false,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs', {}, { async: true })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine, async: false (local override), and html-minifier-terser', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.ejs', { text: 'text' }, { async: false })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), { text: 'text' }, { async: false }), minifierOpts), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine, async: true (local override), and html-minifier-terser in production mode', async t => {
  const numTests = 3
  t.plan(numTests * 4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: {
      async: false,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('ejs-async.ejs', {}, { async: true })
  })

  await fastify.listen({ port: 0 })

  for (let i = 0; i < numTests; i++) {
    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), responseContent)

    if (i === numTests - 1) await fastify.close()
  }
})

test('reply.view with ejs engine, async: false (local override), and html-minifier-terser in production mode', async t => {
  const numTests = 2
  t.plan(numTests * 4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.ejs', { text: 'text' }, { async: false })
  })

  await fastify.listen({ port: 0 })

  for (let i = 0; i < numTests; i++) {
    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), { text: 'text' }, { async: false }), minifierOpts), responseContent)

    if (i === numTests - 1) await fastify.close()
  }
})

test('reply.view with ejs engine and async: true and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/ejs-async.ejs', 'utf8') }, {}, { async: true })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine and async: true and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs }
  })

  fastify.get('/', (_req, reply) => {
    reply.view(ejs.compile(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), { async: true }), {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), responseContent)

  await fastify.close()
})

test('reply.view with promise error', async t => {
  t.plan(1)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs }
  })

  fastify.get('/', (_req, reply) => {
    reply.view(() => Promise.reject(new Error('error')), {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.viewAsync with ejs engine and async: true (global option)', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: { async: true },
    templates: 'templates'
  })

  fastify.get('/', async (_req, reply) => {
    return reply.viewAsync('ejs-async.ejs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), responseContent)

  await fastify.close()
})

test('reply.viewAsync with ejs engine, async: true (global option), and html-minifier-terser', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    return reply.viewAsync('ejs-async.ejs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), responseContent)

  await fastify.close()
})
