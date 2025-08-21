'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const path = require('node:path')
const ejs = require('ejs')
const templatesFolder = 'templates'
const options = {
  filename: path.resolve(templatesFolder),
  views: [path.join(__dirname, '..')]
}

test('reply.view with ejs engine, template folder specified, include files (ejs and html) used in template, includeViewExtension property as true', async t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
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
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  let content = null

  await new Promise(resolve => {
    ejs.renderFile(path.join(templatesFolder, 'index-linking-other-pages.ejs'), data, options, function (err, str) {
      content = str
      t.assert.ifError(err)
      t.assert.strictEqual(content.length, responseContent.length)
      resolve()
    })
  })
  const expectedContent = '<!DOCTYPE html><html lang="en">  <head></head>  <body>    <p>text</p>    <br/>    <div>      <p>Other EJS pages with includes:</p>      <ul>        <li>Normal page, <a href="/include-test">here</a></li>        <li>One include not exist, <a href="/include-one-include-missing-test">here</a>          (to raise errors)        </li>        <li>One attribute not exist, <a href="/include-one-attribute-missing-test">here</a>          (to raise errors)        </li>      </ul>    <div>  </body></html>'
  t.assert.strictEqual(content.replace(/\r?\n/g, ''), expectedContent) // normalize new lines for cross-platform

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; home', async t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
    engine: {
      ejs
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
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  let content = null
  await new Promise(resolve => {
    ejs.renderFile(path.join(templatesFolder, 'index.ejs'), data, options, function (err, str) {
      content = str
      t.assert.ifError(err)
      t.assert.strictEqual(content.length, responseContent.length)
      resolve()
    })
  })
  const expectedContent = '<!DOCTYPE html><html lang="en">  <head></head>  <body>    <p>Hello from EJS Templates</p>    <br/>  </body></html>'
  t.assert.strictEqual(content.replace(/\r?\n/g, ''), expectedContent) // normalize new lines for cross-platform

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with includes', async t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
    engine: {
      ejs
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
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  let content = null
  await new Promise(resolve => {
    ejs.renderFile(path.join(templatesFolder, 'index-with-includes.ejs'), data, options, function (err, str) {
      content = str
      t.assert.ifError(err)
      t.assert.strictEqual(content.length, responseContent.length)
      resolve()
    })
  })

  const expectedContent = '<!DOCTYPE html><html lang="en">  <head></head>  <body>        <header>      Sample header (ejs)    </header>    <p>Hello from EJS Templates</p>        <footer>      Sample footer (html) - Back to <a href="/">Home</a>    </footer>  </body></html>'
  t.assert.strictEqual(content.replace(/\r?\n/g, ''), expectedContent) // normalize new lines for cross-platform

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with one include missing', async t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
    engine: {
      ejs
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
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')

  let content = null
  await new Promise(resolve => {
    ejs.renderFile(path.join(templatesFolder, 'index-with-includes-one-missing.ejs'), data, options, function (err, str) {
      content = str
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(content, undefined)
      resolve()
    })
  })
  t.assert.strictEqual(content, undefined)

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with one attribute missing', async t => {
  t.plan(6)
  const fastify = Fastify()

  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/include-one-attribute-missing-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-and-attribute-missing', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/include-one-attribute-missing-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')

  let content = null
  await new Promise(resolve => {
    ejs.renderFile(path.join(templatesFolder, 'index-with-includes-and-attribute-missing.ejs'), data, options, function (err, str) {
      content = str
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(content, undefined)
      resolve()
    })
  })

  t.assert.strictEqual(content, undefined)

  await fastify.close()
})
