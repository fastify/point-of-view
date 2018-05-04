'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')

test('reply.view with ejs engine, template folder specified, include files (ejs and html) used in template, includeViewExtension property as true; requires TAP snapshots enabled', t => {
  t.plan(8)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder), // needed for include files to be resolved in include directive ...
    views: [__dirname] // must be put to make tests (with include files) working ...
  }
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-linking-other-pages', data) // sample for specifying with type
    // reply.view('index-linking-other-pages', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-linking-other-pages.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.strictEqual(content.length, body.length)
      })
      t.matchSnapshot(content, 'output')

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; requires TAP snapshots enabled; home', t => {
  t.plan(8)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.strictEqual(content.length, body.length)
      })
      t.matchSnapshot(content, 'output')

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; requires TAP snapshots enabled; page with includes', t => {
  t.plan(8)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/include-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-test'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.strictEqual(content.length, body.length)
      })
      t.matchSnapshot(content, 'output')

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; requires TAP snapshots enabled; page with one include missing', t => {
  t.plan(8)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/include-one-include-missing-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-one-missing', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-one-include-missing-test'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes-one-missing.ejs', data, options, function (err, str) {
        content = str
        t.type(err, Error) // expected Error here ...
        t.strictEqual(content, undefined)
      })
      t.matchSnapshot(content, 'output')

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; requires TAP snapshots enabled; page with one attribute missing', t => {
  t.plan(8)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/include-one-attribute-missing-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-and-attribute-missing', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-one-attribute-missing-test'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes-and-attribute-missing.ejs', data, options, function (err, str) {
        content = str
        t.type(err, Error) // expected Error here ...
        t.strictEqual(content, undefined)
      })
      t.matchSnapshot(content, 'output')

      fastify.close()
    })
  })
})
