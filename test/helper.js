'use strict'

const POV = require('..')
const Fastify = require('fastify')
const minifier = require('html-minifier')
const fs = require('fs')
const dot = require('dot')
const eta = require('eta')
const handlebars = require('handlebars')
const { Liquid } = require('liquidjs')
const nunjucks = require('nunjucks')
const pug = require('pug')
const Twig = require('twig')
const sget = require('simple-get').concat

const data = { text: 'text' }
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

module.exports.dotHtmlMinifierTests = function (t, compileOptions, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with dot engine and html-minifier', t => {
    t.plan(6)
    const fastify = Fastify()
    dot.log = false

    fastify.register(POV, {
      engine: {
        dot: dot
      },
      root: 'templates',
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
      }
    })

    fastify.get('/', (req, reply) => {
      reply.view('testdot', data)
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
        t.strictEqual(minifier.minify(dot.process(compileOptions).testdot(data), options), body.toString())
        fastify.close()
      })
    })
  })
}

module.exports.etaHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with eta engine and html-minifier', t => {
    t.plan(6)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        eta: eta
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
      }
    })

    fastify.get('/', (req, reply) => {
      reply.view('templates/index.eta', data)
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
        t.strictEqual(minifier.minify(eta.render(fs.readFileSync('./templates/index.eta', 'utf8'), data), options), body.toString())
        fastify.close()
      })
    })
  })
}

module.exports.handleBarsHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('fastify.view with handlebars engine and html-minifier', t => {
    t.plan(2)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        handlebars: handlebars
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts }),
        partials: { body: './templates/body.hbs' }
      }
    })

    fastify.ready(err => {
      t.error(err)

      fastify.view('./templates/index.html', data).then(compiled => {
        t.strictEqual(minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), options), compiled)
        fastify.close()
      })
    })
  })
}

module.exports.liquidHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with liquid engine and html-minifier', t => {
    t.plan(7)
    const fastify = Fastify()
    const engine = new Liquid()

    fastify.register(POV, {
      engine: {
        liquid: engine
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
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
        t.strictEqual(response.headers['content-length'], String(body.length))
        t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        engine.renderFile('./templates/index.liquid', data)
          .then((html) => {
            t.error(err)
            t.strictEqual(minifier.minify(html, options), body.toString())
          })
        fastify.close()
      })
    })
  })
}

module.exports.nunjucksHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with nunjucks engine, full path templates folder, and html-minifier', t => {
    t.plan(6)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        nunjucks: nunjucks
      },
      templates: 'templates',
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
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
        t.strictEqual(response.headers['content-length'], String(body.length))
        t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        // Global Nunjucks templates dir changed here.
        t.strictEqual(minifier.minify(nunjucks.render('./index.njk', data), options), body.toString())
        fastify.close()
      })
    })
  })
}

module.exports.pugHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with pug engine and html-minifier', t => {
    t.plan(6)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        pug: pug
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
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
        t.strictEqual(response.headers['content-length'], String(body.length))
        t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        t.strictEqual(minifier.minify(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), options), body.toString())
        fastify.close()
      })
    })
  })
}

module.exports.twigHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with twig engine and html-minifier', t => {
    t.plan(7)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        twig: Twig
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
      }
    })

    fastify.get('/', (req, reply) => {
      reply.view('./templates/index.twig', data)
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
        Twig.renderFile('./templates/index.twig', data, (err, html) => {
          t.error(err)
          t.strictEqual(minifier.minify(html, options), body.toString())
        })
        fastify.close()
      })
    })
  })
}
