'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const minifier = require('html-minifier')
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

test('reply.view with marko engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.marko', data)
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
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for marko without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.marko')
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
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for marko without data-parameter but without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.marko')
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
      t.strictEqual(marko.load('./templates/index.marko').renderToString(), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with marko engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.marko', {})
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
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with marko engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.marko', data)
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
      t.strictEqual(minifier.minify(marko.load('./templates/index.marko').renderToString(data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with marko engine, with stream', t => {
  t.plan(5)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.marko', data, { stream: true })
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/octet-stream')
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with marko engine, with stream and html-minify-stream', t => {
  t.plan(5)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }
  const htmlMinifyStream = require('html-minify-stream')

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    },
    options: {
      useHtmlMinifyStream: htmlMinifyStream,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.marko', data, { stream: true })
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/octet-stream')
      t.strictEqual(minifier.minify(marko.load('./templates/index.marko').renderToString(data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})
