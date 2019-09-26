'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const path = require('path')
const minifier = require('html-minifier')
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

test('reply.view with nunjucks engine and custom templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.njk', data)
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
      // Global Nunjucks templates dir changed here.
      t.strictEqual(nunjucks.render('./index.njk', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for nunjucks engine without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    },
    templates: 'templates',
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.njk')
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
      // Global Nunjucks templates dir changed here.
      t.strictEqual(nunjucks.render('./index.njk', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for nunjucks engine without data-parameter and without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.njk')
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
      // Global Nunjucks templates dir changed here.
      t.strictEqual(nunjucks.render('./index.njk'), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine and full path templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    },
    templates: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.njk', data)
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
      // Global Nunjucks templates dir changed here.
      t.strictEqual(nunjucks.render('./index.njk', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine, full path templates folder, and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    },
    templates: path.join(__dirname, '../templates'),
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.njk', data)
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
      // Global Nunjucks templates dir changed here.
      t.strictEqual(minifier.minify(nunjucks.render('./index.njk', data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine and includeViewExtension is true', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
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
      // Global Nunjucks templates dir is  `./` here.
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine using onConfigure callback', t => {
  t.plan(7)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    },
    options: {
      onConfigure: env => {
        env.addGlobal('myGlobalVar', 'my global var value')
      }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-global.njk', data)
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
      // Global Nunjucks templates dir is  `./` here.
      t.strictEqual(nunjucks.render('./templates/index-with-global.njk', data), body.toString())
      t.match(body.toString(), /.*<p>my global var value<\/p>/)
      fastify.close()
    })
  })
})
