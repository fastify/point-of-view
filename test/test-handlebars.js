'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('fs')
const { join } = require('path')
const proxyquire = require('proxyquire')

require('./helper').handleBarsHtmlMinifierTests(t, true)
require('./helper').handleBarsHtmlMinifierTests(t, false)

test('fastify.view with handlebars engine', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data).then(compiled => {
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view for handlebars without data-parameter but defaultContext', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    defaultContext: data
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html').then(compiled => {
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view for handlebars without data-parameter and without defaultContext', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html').then(compiled => {
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine and defaultContext', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    defaultContext: data
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', {}).then(compiled => {
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('reply.view for handlebars engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for handlebars engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for handlebars engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for handlebars engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine and callback', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine with layout option', t => {
  t.plan(3)

  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'it works!' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index-for-layout.hbs', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine catches render error', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  handlebars.registerHelper('badHelper', () => { throw new Error('kaboom') })

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/error.hbs')
  })

  fastify.inject({
    method: 'GET',
    url: '/'
  }, (err, res) => {
    t.error(err)
    t.strictEqual(JSON.parse(res.body).message, 'kaboom')
    t.strictEqual(res.statusCode, 500)
  })
})

test('reply.view with handlebars engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', {})
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and includeViewExtension property as true', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, template folder specified, include files (ejs and html) used in template, includeViewExtension property as true', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder), // needed for include files to be resolved in include directive ...
    views: [__dirname] // must be put to make tests (with include files) working ...
  }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-linking-other-pages', data) // sample for specifying with type
    // reply.view('index-with-includes', data)
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

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; home', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
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

      fastify.close()
    })
  })
})

test('reply.view with handlebars engine and includeViewExtension property as true', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine and callback in production mode', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    production: true
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('./templates/index.html', data, (err, compiled) => {
          t.error(err)
          t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
          fastify.close()
        })
      })
    })
  })
})

test('reply.view with handlebars engine with partials', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    options: {
      partials: { body: './templates/body.hbs' }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + replyBody.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'))(data), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine with missing partials path', t => {
  t.plan(5)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    options: {
      partials: { body: './non-existent' }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-length'], String(replyBody.length))
      t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')

      fastify.close()
    })
  })
})

test('reply.view with handlebars engine with partials in production mode should use cache', t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const POV = proxyquire('..', {
    hashlru: function () {
      return {
        get: (key) => {
          t.is(key, 'handlebars-Partials')
        },
        set: (key, value) => {
          t.is(key, 'handlebars-Partials')
          t.strictDeepEqual(value, { body: fs.readFileSync('./templates/body.hbs', 'utf8') })
        }
      }
    }
  })

  fastify.register(POV, {
    engine: {
      handlebars: handlebars
    },
    options: {
      partials: { body: './templates/body.hbs' }
    },
    production: true
  })

  fastify.ready(err => {
    t.error(err)
    fastify.close()
  })
})

test('fastify.view with handlebars engine with missing partials path in production mode does not start', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    options: {
      partials: { body: './non-existent' }
    },
    production: true
  })

  fastify.ready(err => {
    t.ok(err instanceof Error)
    t.is(err.message, `ENOENT: no such file or directory, open '${join(__dirname, '../non-existent')}'`)
  })
})

test('reply.view with handlebars engine with layout option', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-for-layout.hbs')
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + replyBody.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))({}), replyBody.toString())
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine, missing template file', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./missing.html', {}, err => {
      t.ok(err instanceof Error)
      t.is(err.message, `ENOENT: no such file or directory, open '${join(__dirname, '../missing.html')}'`)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view(null, {}, err => {
      t.ok(err instanceof Error)
      t.is(err.message, 'Missing page')
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine should return 500 if template fails in production mode', t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const POV = proxyquire('..', {
    hashlru: function () {
      return {
        get: () => {
          return () => { throw Error('Template Error') }
        },
        set: () => { }
      }
    }
  })

  fastify.register(POV, {
    engine: {
      handlebars: handlebars
    },
    layout: './templates/layout.hbs',
    production: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.hbs')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      const { message } = JSON.parse(body.toString())
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual('Template Error', message)

      fastify.close()
    })
  })
})
