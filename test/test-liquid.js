'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')

require('./helper').liquidHtmlMinifierTests(t, true)
require('./helper').liquidHtmlMinifierTests(t, false)

test('reply.view with liquid engine', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.liquid', data)
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
      engine.renderFile('./templates/index.liquid', data)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view with liquid engine without data-parameter but defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.liquid')
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
      engine.renderFile('./templates/index.liquid', data)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view with liquid engine without data-parameter but without defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.liquid')
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
      engine.renderFile('./templates/index.liquid')
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view with liquid engine with data-parameter and defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.liquid', {})
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
      engine.renderFile('./templates/index.liquid', data)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view for liquid engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const localsData = { text: 'text from locals' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.liquid', {})
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
      engine.renderFile('./templates/index.liquid', localsData)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view for liquid engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.liquid', data)
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
      engine.renderFile('./templates/index.liquid', data)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view for liquid engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const localsData = { text: 'text from locals' }
  const defaultContext = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    },
    defaultContext
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.liquid')
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
      engine.renderFile('./templates/index.liquid', localsData)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view for liquid engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const localsData = { text: 'text from locals' }
  const defaultContext = { text: 'text from context' }
  const data = { text: 'text' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    },
    defaultContext
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.liquid', data)
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
      engine.renderFile('./templates/index.liquid', data)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view with liquid engine and custom tag', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'text' }

  const engine = new Liquid()

  engine.registerTag('header', {
    parse: function (token) {
      const [key, val] = token.args.split(':')
      this[key] = val
    },
    render: async function (scope, emitter) {
      const title = await this.liquid.evalValue(this.content, scope)
      emitter.write(`<h1>${title}</h1>`)
    }
  })

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-custom-tag.liquid', data)
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
      engine.renderFile('./templates/index-with-custom-tag.liquid', data)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('reply.view with liquid engine and double quoted variable', t => {
  t.plan(7)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const data = { text: 'foo' }

  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/double-quotes-variable.liquid', data)
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
      engine.renderFile('./templates/double-quotes-variable.liquid', data)
        .then((html) => {
          t.error(err)
          t.strictEqual(html, body.toString())
        })
      fastify.close()
    })
  })
})

test('fastify.view with liquid engine, should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const { Liquid } = require('liquidjs')
  const engine = new Liquid()

  fastify.register(require('../index'), {
    engine: {
      liquid: engine
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
