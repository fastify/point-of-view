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

test('reply.view with ejs-mate engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejsMate = require('ejs-mate')
  const data = { text: 'text', header: 'header', footer: 'footer' }

  fastify.register(require('../index'), {
    engine: {
      'ejs-mate': ejsMate
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/content.ejs', data)
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
      t.strictEqual(body.toString(), '<html><head></head><body><h1>header</h1><div>text</div><div>footer</div></body></html>')
      fastify.close()
    })
  })
})

test('reply.view for ejs-mate engine without data-parameter but with defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejsMate = require('ejs-mate')
  const data = { text: 'text', header: 'header', footer: 'footer' }

  fastify.register(require('../index'), {
    engine: {
      'ejs-mate': ejsMate
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/content.ejs')
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
      t.strictEqual('<html><head></head><body><h1>header</h1><div>text</div><div>footer</div></body></html>', body.toString())
      fastify.close()
    })
  })
})

test('reply.view for ejs-mate engine without data and without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejsMate = require('ejs-mate')

  fastify.register(require('../index'), {
    engine: {
      'ejs-mate': ejsMate
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-bare.html')
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
      t.strictEqual(body.toString(), '<!DOCTYPE html><html lang="en"><head></head><body><p>test</p><br/></body></html>')
      fastify.close()
    })
  })
})

test('reply.view with ejs-mate engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejsMate = require('ejs-mate')
  const data = { text: 'text', header: 'header', footer: 'footer' }

  fastify.register(require('../index'), {
    engine: {
      'ejs-mate': ejsMate
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/content.ejs', {})
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
      t.strictEqual('<html><head></head><body><h1>header</h1><div>text</div><div>footer</div></body></html>', body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs-mate engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejsMate = require('ejs-mate')
  const data = { text: 'text', header: 'header', footer: 'footer' }

  fastify.register(require('../index'), {
    engine: {
      'ejs-mate': ejsMate
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/content.ejs', data)
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
      t.strictEqual(minifier.minify('<html><head></head><body><h1>header</h1><div>text</div><div>footer</div></body></html>', minifierOpts), body.toString())
      fastify.close()
    })
  })
})
