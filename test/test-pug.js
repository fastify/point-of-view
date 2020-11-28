'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('fs')
const proxyquire = require('proxyquire')

require('./helper').pugHtmlMinifierTests(t, true)
require('./helper').pugHtmlMinifierTests(t, false)

test('reply.view with pug engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug', data)
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine in production mode should use cache', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const POV = proxyquire('..', {
    hashlru: function () {
      return {
        get: () => {
          return () => '<div>Cached Response</div>'
        },
        set: () => { }
      }
    }
  })

  fastify.register(POV, {
    engine: {
      pug: pug
    },
    production: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], String(body.length))
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual('<div>Cached Response</div>', body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine and includes', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/sample.pug', data)
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
      t.strictEqual(pug.renderFile('./templates/sample.pug', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug')
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug without data-parameter and without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug')
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8')), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug', {})
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug')
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug', data)
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug')
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug', data)
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine, will preserve content-type', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    }
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/xml')
    reply.view('./templates/index.pug', data)
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
      t.strictEqual(response.headers['content-type'], 'text/xml')
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with pug engine, should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug: pug
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

test('reply.view with pug engine, should throw error if non existent template path', t => {
  t.plan(5)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    },
    templates: 'non-existent'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./test/index.html')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      t.strictEqual(response.headers['content-length'], String(body.length))
      fastify.close()
    })
  })
})

test('reply.view with pug engine should return 500 if compile fails', t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = {
    compile: () => { throw Error('Compile Error') }
  }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.pug')
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
      t.strictEqual('Compile Error', message)

      fastify.close()
    })
  })
})
