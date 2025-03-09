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

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await minifier.minify(dot.process(compileOptions).testdot(data), options), responseContent)

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

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(dot.process(compileOptions).testdot(data), responseContent)

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

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await minifier.minify(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), options), responseContent)

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

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await minifier.minify(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), options), responseContent)

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

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(eta.renderString(fs.readFileSync('./templates/index.eta', 'utf8'), data), responseContent)

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
        t.assert.strictEqual(await minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), options), compiled)
        fastify.close()
        end()
      })
    })
  })
}

module.exports.liquidHtmlMinifierTests = function (withMinifierOptions) {
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

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    const html = await engine.renderFile('./templates/index.liquid', data)

    t.assert.strictEqual(await minifier.minify(html, options), responseContent)

    await fastify.close()
  })
  test('reply.view with liquid engine and paths excluded from html-minifier-terser', async t => {
    t.plan(4)
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

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/test')

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    const html = await engine.renderFile('./templates/index.liquid', data)

    t.assert.strictEqual((await minifier.minify(html, options)).trim(), responseContent.trim())

    await fastify.close()
  })
}

module.exports.nunjucksHtmlMinifierTests = function (withMinifierOptions) {
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with nunjucks engine, full path templates folder, and html-minifier-terser', async t => {
    t.plan(4)
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

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    t.assert.strictEqual(await minifier.minify(nunjucks.render('./index.njk', data), options), responseContent)

    await fastify.close()
  })
  test('reply.view with nunjucks engine, full path templates folder, and paths excluded from html-minifier-terser', async t => {
    t.plan(4)
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

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/test')

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    t.assert.strictEqual(nunjucks.render('./index.njk', data), responseContent)

    await fastify.close()
  })
}

module.exports.pugHtmlMinifierTests = function (withMinifierOptions) {
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with pug engine and html-minifier-terser', async t => {
    t.plan(4)
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

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    t.assert.strictEqual(await minifier.minify(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), options), responseContent)

    await fastify.close()
  })
  test('reply.view with pug engine and paths excluded from html-minifier-terser', async t => {
    t.plan(4)
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

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/test')

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), responseContent)

    await fastify.close()
  })
}

module.exports.twigHtmlMinifierTests = function (withMinifierOptions) {
  const options = withMinifierOptions ? minifierOpts : {}

  test('reply.view with twig engine and html-minifier-terser', async t => {
    t.plan(5)
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

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    await new Promise((resolve) => {
      Twig.renderFile('./templates/index.twig', data, async (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(await minifier.minify(html, options), responseContent)
        resolve()
      })
    })

    await fastify.close()
  })
  test('reply.view with twig engine and paths excluded from html-minifier-terser', async t => {
    t.plan(5)
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

    await fastify.listen({ port: 0 })

    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/test')

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

    await new Promise((resolve) => {
      Twig.renderFile('./templates/index.twig', data, async (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, responseContent)
        resolve()
      })
    })

    await fastify.close()
  })
}
