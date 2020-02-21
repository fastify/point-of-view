'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
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

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.deepEqual(JSON.parse(body), { hello: 'world' })
      fastify.close()
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

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
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
    t.is(err.message, 'Missing engine')
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
    t.is(err.message, '\'notSupported\' not yet supported, PR? :)')
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
    t.deepEqual('unable to access template "./templates/does-not-exist.hbs"', err.message)
  })
})

test('register callback should throw if layout option is provided and engine is not handlebars or ejs', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('../index'), {
    engine: {
      'ejs-mate': require('ejs-mate')
    },
    layout: './templates/layout.hbs'
  }).ready(err => {
    t.ok(err instanceof Error)
    t.deepEqual('"layout" option only available for handlebars and ejs engine', err.message)
  })
})
