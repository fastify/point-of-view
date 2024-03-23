'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('node:fs')
const { join } = require('node:path')

require('./helper').handleBarsHtmlMinifierTests(t, true)
require('./helper').handleBarsHtmlMinifierTests(t, false)

test('fastify.view with handlebars engine', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data).then(compiled => {
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
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
      handlebars
    },
    defaultContext: data
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html').then(compiled => {
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
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
      handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html').then(compiled => {
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(), compiled)
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
      handlebars
    },
    defaultContext: data
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', {}).then(compiled => {
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
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
      handlebars
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html')
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(localsData), body.toString())
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
      handlebars
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
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
      handlebars
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(localsData), body.toString())
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
      handlebars
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
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
      handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine with layout option on render', t => {
  t.plan(3)

  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'it works!' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index-for-layout.hbs', data, { layout: './templates/layout.hbs' }, (err, compiled) => {
      t.error(err)
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine with invalid layout option on render should throw', t => {
  t.plan(5)

  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'it works!' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)
    fastify.view('./templates/index-for-layout.hbs', data, { layout: './templates/invalid-layout.hbs' }, (err, compiled) => {
      t.ok(err instanceof Error)
      t.equal(err.message, 'unable to access template "./templates/invalid-layout.hbs"')
    })
    // repeated for test coverage of layout access check lru
    fastify.view('./templates/index-for-layout.hbs', data, { layout: './templates/invalid-layout.hbs' }, (err, compiled) => {
      t.ok(err instanceof Error)
      t.equal(err.message, 'unable to access template "./templates/invalid-layout.hbs"')
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
      handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
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
      handlebars
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
    t.equal(JSON.parse(res.body).message, 'kaboom')
    t.equal(res.statusCode, 500)
  })
})

test('reply.view with handlebars engine and layout catches render error', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  handlebars.registerHelper('badHelper', () => { throw new Error('kaboom') })

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/error.hbs')
  })

  fastify.inject({
    method: 'GET',
    url: '/'
  }, (err, res) => {
    t.error(err)
    t.equal(JSON.parse(res.body).message, 'kaboom')
    t.equal(res.statusCode, 500)
  })
})

test('reply.view with handlebars engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', {})
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
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
      handlebars
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index', data)
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), body.toString())
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
      handlebars
    },
    production: true
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('./templates/index.html', data, (err, compiled) => {
          t.error(err)
          t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
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
      handlebars
    },
    options: {
      partials: { body: './templates/body.hbs' }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'))(data), replyBody.toString())
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
      handlebars
    },
    options: {
      partials: { body: './non-existent' }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-length'], String(replyBody.length))
      t.equal(response.headers['content-type'], 'application/json; charset=utf-8')

      fastify.close()
    })
  })
})

test('reply.view with handlebars engine with partials in production mode should use cache', t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const POV = require('..')
  fastify.decorate(POV.fastifyViewCache, {
    get: (key) => {
      t.equal(key, 'handlebars|body:./templates/body.hbs|null-Partials')
    },
    set: (key, value) => {
      t.equal(key, 'handlebars|body:./templates/body.hbs|null-Partials')
      t.strictSame(value, { body: fs.readFileSync('./templates/body.hbs', 'utf8') })
    }
  })

  fastify.register(POV, {
    engine: {
      handlebars
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
      handlebars
    },
    options: {
      partials: { body: './non-existent' }
    },
    production: true
  })

  fastify.ready(err => {
    t.ok(err instanceof Error)
    t.equal(err.message, `ENOENT: no such file or directory, open '${join(__dirname, '../non-existent')}'`)
  })
})

test('reply.view with handlebars engine with compile options', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars').create()
  const compileOptions = { preventIndent: true, strict: true }
  const data = { text: 'hello\nworld' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      compileOptions,
      partials: { body: './templates/body.hbs' }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'), compileOptions)(data), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine with useDataVariables', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars').create()
  const compileOptions = { strict: true }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      compileOptions,
      useDataVariables: true,
      partials: { body: './templates/body-data.hbs' }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.locals = data
    reply.view('./templates/index-with-partials.hbs', null)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'), compileOptions)(null, { data }), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine with useDataVariables and global Ctx', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars').create()
  const compileOptions = { strict: true }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      compileOptions,
      useDataVariables: true,
      partials: { body: './templates/body-data.hbs' }
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-partials.hbs', null)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'), compileOptions)(null, { data }), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine with layout option', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-for-layout.hbs')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))({}), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine with layout option on render', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-for-layout.hbs', {}, { layout: './templates/layout.hbs' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))({}), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view should return 500 if layout is missing on render', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-for-layout.hbs', {}, { layout: './templates/missing-layout.hbs' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 500)
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
      handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./missing.html', {}, err => {
      t.ok(err instanceof Error)
      t.equal(err.message, `ENOENT: no such file or directory, open '${join(__dirname, '../missing.html')}'`)
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
      handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view(null, {}, err => {
      t.ok(err instanceof Error)
      t.equal(err.message, 'Missing page')
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine should return 500 if template fails in production mode', t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const POV = require('..')
  fastify.decorate(POV.fastifyViewCache, {
    get: () => {
      return () => { throw Error('Template Error') }
    },
    set: () => { }
  })

  fastify.register(POV, {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs',
    production: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-for-layout.hbs')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      const { message } = JSON.parse(body.toString())
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal('Template Error', message)

      fastify.close()
    })
  })
})

test('reply.view with handlebars engine and raw template', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/html').view({ raw: fs.readFileSync('./templates/index.html', 'utf8') }, data)
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
      t.equal(response.headers['content-type'], 'text/html')
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine and function template', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8')), data)
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine and empty template', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view(null, data)
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

test('fastify.view with handlebars engine and callback in production mode and header', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    production: true,
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/html').view('./templates/index-for-layout.hbs', null)
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
      t.equal(response.headers['content-type'], 'text/html')
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine and both layout', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/html').view('./templates/index.hbs', data, { layout: './templates/layout.hbs' })
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

test('reply.viewAsync for handlebars engine without defaultContext but with reply.locals and data-parameter, with async fastify  hooks', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.addHook('preHandler', async function (request, reply) {
    reply.locals = localsData
  })

  fastify.get('/', async (req, reply) => {
    return reply.viewAsync('./templates/index.html', data)
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
      t.equal(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})
