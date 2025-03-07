'use strict'

const { test } = require('node:test')
const POV = require('..')
const Fastify = require('fastify')
const minifier = require('html-minifier-terser')
const fs = require('node:fs')
const dot = require('dot')
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

module.exports.dotHtmlMinifierTests = function (compileOptions, withMinifierOptions) {
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with dot engine and html-minifier-terser', async t => {
    t.plan(4)
    const fastify = Fastify()
    dot.log = false

    fastify.register(POV, {
      engine: {
        dot
      },
      root: 'templates',
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
      }
    })

    fastify.get('/', (_req, reply) => {
      reply.view('testdot', data)
    })

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.deepStrictEqual(result.status, 200)
    t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.deepStrictEqual(await minifier.minify(dot.process(compileOptions).testdot(data), options), responseContent)

    await fastify.close()
  })
  test('reply.view with dot engine and paths excluded from html-minifier-terser', async t => {
    t.plan(4)
    const fastify = Fastify()
    dot.log = false

    fastify.register(POV, {
      engine: {
        dot
      },
      root: 'templates',
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts }),
        pathsToExcludeHtmlMinifier: ['/test']
      }
    })

    fastify.get('/test', (_req, reply) => {
      reply.view('testdot', data)
    })

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/test')

    const responseContent = await result.text()

    t.assert.deepStrictEqual(result.status, 200)
    t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.deepStrictEqual(dot.process(compileOptions).testdot(data), responseContent)

    await fastify.close()
  })
}

module.exports.etaHtmlMinifierTests = function (withMinifierOptions) {
  const { Eta } = require('eta')
  const eta = new Eta()

  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with eta engine and html-minifier-terser', async t => {
    t.plan(4)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        eta
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
      }
    })

    fastify.get('/', (_req, reply) => {
      reply.view('templates/index.eta', data)
    })

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.deepStrictEqual(result.status, 200)
    t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.deepStrictEqual(await minifier.minify(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), options), responseContent)

    await fastify.close()
  })

  test('reply.view with eta engine and async and html-minifier-terser', async t => {
    t.plan(4)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        eta
      },
      options: {
        useHtmlMinifier: minifier,
        async: true,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
      }
    })

    fastify.get('/', (_req, reply) => {
      reply.view('templates/index.eta', data)
    })

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.deepStrictEqual(result.status, 200)
    t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.deepStrictEqual(await minifier.minify(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), options), responseContent)

    await fastify.close()
  })
  test('reply.view with eta engine and paths excluded from html-minifier-terser', async t => {
    t.plan(4)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        eta
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts }),
        pathsToExcludeHtmlMinifier: ['/test']
      }
    })

    fastify.get('/test', (_req, reply) => {
      reply.view('templates/index.eta', data)
    })

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/test')

    const responseContent = await result.text()

    t.assert.deepStrictEqual(result.status, 200)
    t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.deepStrictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

    await fastify.close()
  })
}

module.exports.handleBarsHtmlMinifierTests = function (withMinifierOptions) {
  const options = withMinifierOptions ? minifierOpts : {}

  test('fastify.view with handlebars engine and html-minifier-terser', (t, end) => {
    t.plan(2)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        handlebars
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts }),
        partials: { body: './templates/body.hbs' }
      }
    })

    fastify.ready(err => {
      t.assert.ifError(err)

      fastify.view('./templates/index.html', data).then(async compiled => {
        t.assert.deepStrictEqual(await minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), options), compiled)
        fastify.close()
        end()
      })
    })
  })
}

module.exports.liquidHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with liquid engine and html-minifier-terser', async t => {
    t.plan(4)
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

    fastify.get('/', (_req, reply) => {
      reply.view('./templates/index.liquid', data)
    })

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.deepStrictEqual(result.status, 200)
    t.assert.deepStrictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.deepStrictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    const html = await engine.renderFile('./templates/index.liquid', data)

    t.assert.deepStrictEqual(await minifier.minify(html, options), responseContent)

    await fastify.close()
  })
  test('reply.view with liquid engine and paths excluded from html-minifier-terser', t => {
    t.plan(7)
    const fastify = Fastify()
    const engine = new Liquid()

    fastify.register(POV, {
      engine: {
        liquid: engine
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts }),
        pathsToExcludeHtmlMinifier: ['/test']
      }
    })

    fastify.get('/test', (_req, reply) => {
      reply.view('./templates/index.liquid', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.assert.ifError(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.assert.ifError(err)
        t.assert.deepStrictEqual(response.statusCode, 200)
        t.assert.deepStrictEqual(response.headers['content-length'], String(body.length))
        t.assert.deepStrictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        engine.renderFile('./templates/index.liquid', data)
          .then((html) => {
            t.assert.ifError(err)
            t.assert.deepStrictEqual(html, body.toString())
          })
        fastify.close()
      })
    })
  })
}

module.exports.nunjucksHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with nunjucks engine, full path templates folder, and html-minifier-terser', t => {
    t.plan(6)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        nunjucks
      },
      templates: 'templates',
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
      }
    })

    fastify.get('/', (_req, reply) => {
      reply.view('./index.njk', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.assert.ifError(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, async (err, response, body) => {
        t.assert.ifError(err)
        t.assert.deepStrictEqual(response.statusCode, 200)
        t.assert.deepStrictEqual(response.headers['content-length'], String(body.length))
        t.assert.deepStrictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        // Global Nunjucks templates dir changed here.
        t.assert.deepStrictEqual(await minifier.minify(nunjucks.render('./index.njk', data), options), body.toString())
        fastify.close()
      })
    })
  })
  test('reply.view with nunjucks engine, full path templates folder, and paths excluded from html-minifier-terser', t => {
    t.plan(6)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        nunjucks
      },
      templates: 'templates',
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts }),
        pathsToExcludeHtmlMinifier: ['/test']
      }
    })

    fastify.get('/test', (_req, reply) => {
      reply.view('./index.njk', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.assert.ifError(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.assert.ifError(err)
        t.assert.deepStrictEqual(response.statusCode, 200)
        t.assert.deepStrictEqual(response.headers['content-length'], String(body.length))
        t.assert.deepStrictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        // Global Nunjucks templates dir changed here.
        t.assert.deepStrictEqual(nunjucks.render('./index.njk', data), body.toString())
        fastify.close()
      })
    })
  })
}

module.exports.pugHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with pug engine and html-minifier-terser', t => {
    t.plan(6)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        pug
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts })
      }
    })

    fastify.get('/', (_req, reply) => {
      reply.view('./templates/index.pug', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.assert.ifError(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, async (err, response, body) => {
        t.assert.ifError(err)
        t.assert.deepStrictEqual(response.statusCode, 200)
        t.assert.deepStrictEqual(response.headers['content-length'], String(body.length))
        t.assert.deepStrictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        t.assert.deepStrictEqual(await minifier.minify(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), options), body.toString())
        fastify.close()
      })
    })
  })
  test('reply.view with pug engine and paths excluded from html-minifier-terser', t => {
    t.plan(6)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        pug
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts }),
        pathsToExcludeHtmlMinifier: ['/test']
      }
    })

    fastify.get('/test', (_req, reply) => {
      reply.view('./templates/index.pug', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.assert.ifError(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.assert.ifError(err)
        t.assert.deepStrictEqual(response.statusCode, 200)
        t.assert.deepStrictEqual(response.headers['content-length'], String(body.length))
        t.assert.deepStrictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        t.assert.deepStrictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
        fastify.close()
      })
    })
  })
}

module.exports.twigHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with twig engine and html-minifier-terser', t => {
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

    fastify.get('/', (_req, reply) => {
      reply.view('./templates/index.twig', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.assert.ifError(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, (err, response, body) => {
        t.assert.ifError(err)
        t.assert.deepStrictEqual(response.statusCode, 200)
        t.assert.deepStrictEqual(response.headers['content-length'], String(body.length))
        t.assert.deepStrictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        Twig.renderFile('./templates/index.twig', data, async (err, html) => {
          t.assert.ifError(err)
          t.assert.deepStrictEqual(await minifier.minify(html, options), body.toString())
        })
        fastify.close()
      })
    })
  })
  test('reply.view with twig engine and paths excluded from html-minifier-terser', t => {
    t.plan(7)
    const fastify = Fastify()

    fastify.register(POV, {
      engine: {
        twig: Twig
      },
      options: {
        useHtmlMinifier: minifier,
        ...(withMinifierOptions && { htmlMinifierOptions: minifierOpts }),
        pathsToExcludeHtmlMinifier: ['/test']
      }
    })

    fastify.get('/test', (_req, reply) => {
      reply.view('./templates/index.twig', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.assert.ifError(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.assert.ifError(err)
        t.assert.deepStrictEqual(response.statusCode, 200)
        t.assert.deepStrictEqual(response.headers['content-length'], String(body.length))
        t.assert.deepStrictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
        Twig.renderFile('./templates/index.twig', data, (err, html) => {
          t.assert.ifError(err)
          t.assert.deepStrictEqual(html, body.toString())
        })
        fastify.close()
      })
    })
  })
}
