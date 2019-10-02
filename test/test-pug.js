'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('fs')
const minifier = require('html-minifier')
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

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

test('reply.view with pug engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug: pug
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
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
      t.strictEqual(minifier.minify(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), minifierOpts), body.toString())
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
