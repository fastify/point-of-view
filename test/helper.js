'use strict'

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

module.exports.dotHtmlMinifierTests = function (t, compileOptions, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with dot engine and html-minifier-terser', t => {
    t.plan(6)
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

    fastify.get('/', (req, reply) => {
      reply.view('testdot', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, async (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(await minifier.minify(dot.process(compileOptions).testdot(data), options), body.toString())
        fastify.close()
      })
    })
  })
  test('reply.view with dot engine and paths excluded from html-minifier-terser', t => {
    t.plan(6)
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

    fastify.get('/test', (req, reply) => {
      reply.view('testdot', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(dot.process(compileOptions).testdot(data), body.toString())
        fastify.close()
      })
    })
  })
}

module.exports.etaHtmlMinifierTests = function (t, withMinifierOptions) {
  const { Eta } = require('eta')
  const eta = new Eta()

  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with eta engine and html-minifier-terser', t => {
    t.plan(6)
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

    fastify.get('/', (req, reply) => {
      reply.view('templates/index.eta', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, async (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(await minifier.minify(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), options), body.toString())
        fastify.close()
      })
    })
  })

  test('reply.view with eta engine and async and html-minifier-terser', t => {
    t.plan(6)
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

    fastify.get('/', (req, reply) => {
      reply.view('templates/index.eta', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, async (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(await minifier.minify(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), options), body.toString())
        fastify.close()
      })
    })
  })
  test('reply.view with eta engine and paths excluded from html-minifier-terser', t => {
    t.plan(6)
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

    fastify.get('/test', (req, reply) => {
      reply.view('templates/index.eta', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), body.toString())
        fastify.close()
      })
    })
  })
}

module.exports.handleBarsHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('fastify.view with handlebars engine and html-minifier-terser', t => {
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
      t.error(err)

      fastify.view('./templates/index.html', data).then(async compiled => {
        t.equal(await minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), options), compiled)
        fastify.close()
      })
    })
  })
}

module.exports.liquidHtmlMinifierTests = function (t, withMinifierOptions) {
  const test = t.test
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with liquid engine and html-minifier-terser', t => {
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

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        engine.renderFile('./templates/index.liquid', data)
          .then(async (html) => {
            t.error(err)
            t.equal(await minifier.minify(html, options), body.toString())
          })
        fastify.close()
      })
    })
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

    fastify.get('/test', (req, reply) => {
      reply.view('./templates/index.liquid', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        engine.renderFile('./templates/index.liquid', data)
          .then((html) => {
            t.error(err)
            t.equal(html, body.toString())
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

    fastify.get('/', (req, reply) => {
      reply.view('./index.njk', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, async (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        // Global Nunjucks templates dir changed here.
        t.equal(await minifier.minify(nunjucks.render('./index.njk', data), options), body.toString())
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

    fastify.get('/test', (req, reply) => {
      reply.view('./index.njk', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        // Global Nunjucks templates dir changed here.
        t.equal(nunjucks.render('./index.njk', data), body.toString())
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

    fastify.get('/', (req, reply) => {
      reply.view('./templates/index.pug', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, async (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(await minifier.minify(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), options), body.toString())
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

    fastify.get('/test', (req, reply) => {
      reply.view('./templates/index.pug', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
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

    fastify.get('/', (req, reply) => {
      reply.view('./templates/index.twig', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        Twig.renderFile('./templates/index.twig', data, async (err, html) => {
          t.error(err)
          t.equal(await minifier.minify(html, options), body.toString())
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

    fastify.get('/test', (req, reply) => {
      reply.view('./templates/index.twig', data)
    })

    fastify.listen({ port: 0 }, err => {
      t.error(err)

      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/test'
      }, (err, response, body) => {
        t.error(err)
        t.equal(response.statusCode, 200)
        t.equal(response.headers['content-length'], String(body.length))
        t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
        Twig.renderFile('./templates/index.twig', data, (err, html) => {
          t.error(err)
          t.equal(html, body.toString())
        })
        fastify.close()
      })
    })
  })
}
