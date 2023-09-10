'use strict'

const os = require('node:os')
const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const path = require('node:path')
const fs = require('node:fs')
const Fastify = require('fastify')

test('fastify.view exist', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.view)

    fastify.close()
  })
})

test('fastify.view.clearCache exist', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.view.clearCache)

    fastify.close()
  })
})

test('fastify.view.clearCache clears cache', t => {
  t.plan(13)
  const templatesFolder = path.join(os.tmpdir(), 'fastify')
  try {
    fs.mkdirSync(templatesFolder)
  } catch {}
  fs.writeFileSync(path.join(templatesFolder, 'cache_clear_test.ejs'), '<html><body><span>123</span></body></<html>')
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    },
    includeViewExtension: true,
    templates: templatesFolder,
    production: true
  })

  fastify.get('/view-cache-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('cache_clear_test')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/view-cache-test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      fs.writeFileSync(path.join(templatesFolder, 'cache_clear_test.ejs'), '<html><body><span>456</span></body></<html>')
      const output = body.toString()
      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/view-cache-test'
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.headers['content-length'], '' + body.length)
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(output, body.toString())
        fastify.view.clearCache()
        sget({
          method: 'GET',
          url: 'http://localhost:' + fastify.server.address().port + '/view-cache-test'
        }, (err, response, body) => {
          t.error(err)
          t.equal(response.headers['content-length'], '' + body.length)
          t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
          t.not(output, body.toString())
          t.match(body.toString(), '456')
          fastify.close()
        })
      })
    })
  })
})

test('reply.view exist', t => {
  t.plan(6)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.get('/', (req, reply) => {
    t.ok(reply.view)
    reply.send({ hello: 'world' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.same(JSON.parse(body), { hello: 'world' })
      fastify.close()
    })
  })
})

test('reply.locals exist', t => {
  t.plan(6)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.get('/', (req, reply) => {
    t.ok(reply.locals)
    reply.send({ hello: 'world' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.same(JSON.parse(body), { hello: 'world' })
      fastify.close()
    })
  })
})

test('reply.view can be returned from async function to indicate response processing finished', t => {
  t.plan(6)
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

  fastify.get('/', async (req, reply) => {
    return reply.view('index-for-layout.ejs', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('Possibility to access res.locals variable across all views', t => {
  t.plan(6)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    },
    root: path.join(__dirname, '../templates'),
    layout: 'index-layout-body',
    viewExt: 'ejs'
  })

  fastify.addHook('preHandler', async function (req, reply) {
    reply.locals = {
      content: 'ok'
    }
  })

  fastify.get('/', async (req, reply) => {
    return reply.view('index-layout-content')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal('ok', body.toString().trim())
      fastify.close()
    })
  })
})

test('Default extension for ejs', t => {
  t.plan(6)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    },
    root: path.join(__dirname, '../templates'),
    viewExt: 'html'
  })

  fastify.get('/', async (req, reply) => {
    return reply.view('index-with-includes-without-ext')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal('ok', body.toString().trim())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and custom propertyName', t => {
  t.plan(11)
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

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port,
      headers: { 'user-agent': 'mobile' }
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), { text: 'mobile' }), body.toString())
      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port,
        headers: { 'user-agent': 'desktop' }
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], '' + body.length)
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), { text: 'desktop' }), body.toString())
        fastify.close()
      })
    })
  })
})

test('reply.view should return 500 if page is missing', t => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view()
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      fastify.close()
    })
  })
})

test('reply.view should return 500 if layout is set globally and provided on render', t => {
  t.plan(3)
  const fastify = Fastify()
  const data = { text: 'text' }
  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs'),
      layout: 'layout.html'
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.ejs', data, { layout: 'layout.html' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      fastify.close()
    })
  })
})

test('register callback should throw if the engine is missing', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'))

  fastify.ready(err => {
    t.ok(err instanceof Error)
    t.equal(err.message, 'Missing engine')
  })
})

test('register callback should throw if the engine is not supported', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      notSupported: null
    }
  }).ready(err => {
    t.ok(err instanceof Error)
    t.equal(err.message, '\'notSupported\' not yet supported, PR? :)')
  })
})

test('register callback with handlebars engine should throw if layout file does not exist', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      handlebars: require('handlebars')
    },
    layout: './templates/does-not-exist.hbs'
  }).ready(err => {
    t.ok(err instanceof Error)
    t.same('unable to access template "./templates/does-not-exist.hbs"', err.message)
  })
})

test('register callback should throw if layout option provided with wrong engine', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      pug: require('pug')
    },
    layout: 'template'
  }).ready(err => {
    t.ok(err instanceof Error)
    t.equal(err.message, 'Only Dot, Handlebars, EJS, and Eta support the "layout" option')
  })
})

test('register callback should throw if templates option provided as array with wrong engine', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      pug: require('pug')
    },
    templates: ['layouts', 'pages']
  }).ready(err => {
    t.ok(err instanceof Error)
    t.equal(err.message, 'Only Nunjucks supports the "templates" option as an array')
  })
})

test('plugin is registered with "point-of-view" name', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.ready(err => {
    t.error(err)

    const kRegistedPlugins = Symbol.for('registered-plugin')
    const registeredPlugins = fastify[kRegistedPlugins]
    t.ok(registeredPlugins.find(name => name === '@fastify/view'))

    fastify.close()
  })
})
