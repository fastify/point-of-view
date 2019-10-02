'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const path = require('path')

test('reply.view with art-template engine and custom templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art', data)
  })

  fastify.listen(10086, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.strictEqual(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for art-template without data-parameter and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art')
  })

  fastify.listen(10086, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.strictEqual(art(templatePath, {}), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for art-template without data-parameter but with defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art')
  })

  fastify.listen(10086, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.strictEqual(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with art-template engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates',
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art', {})
  })

  fastify.listen(10086, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.strictEqual(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with art-template engine and full path templates folder', t => {
  t.plan(6)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: path.join(__dirname, '..', 'templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art', data)
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

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.strictEqual(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with art-template engine and includeViewExtension is true', t => {
  t.plan(6)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
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

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.strictEqual(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with art-template engine and full path templates folder', t => {
  t.plan(6)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: path.join(__dirname, '..', 'templates')
  })

  fastify.get('/', (req, reply) => {
    fastify.view('./index', data, (err, html) => {
      t.error(err)
      reply.send(html)
    })
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'text/plain; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.strictEqual(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})
