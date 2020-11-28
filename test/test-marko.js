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

test('reply.view for marko engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
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
      t.strictEqual(marko.load('./templates/index.marko').renderToString(localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for marko engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
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

test('reply.view for marko engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
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
      t.strictEqual(marko.load('./templates/index.marko').renderToString(localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for marko engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
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

test('fastify.view with marko engine and html-minifier without htmlMinifierOptions', t => {
  t.plan(3)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    },
    options: {
      useHtmlMinifier: minifier
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('templates/index.marko', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(minifier.minify(marko.load('./templates/index.marko').renderToString(data)), compiled)

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

test('reply.view with marko engine, with stream and html-minify-stream without htmlMinifierOptions', t => {
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
      useHtmlMinifyStream: htmlMinifyStream
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
      t.strictEqual(minifier.minify(marko.load('./templates/index.marko').renderToString(data)), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with marko engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('templates/index.marko', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('templates/index.marko', data, (err, compiled) => {
          t.error(err)
          t.strictEqual(marko.load('./templates/index.marko').renderToString(data), compiled)
          fastify.close()
        })
      })
    })
  })
})

test('fastify.view to load template from memory with marko engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'marko' }
  const templateSrc = `
<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body>
    <p>\${data.text}</p>
  </body>
</html>
`

  const opts = { templateSrc }

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('templates/index.marko', data, opts, (err, compiled) => {
      t.error(err)
      const markoLoaded = marko.load('./templates/index.marko', opts).renderToString(data)

      t.strictEqual(markoLoaded, compiled)
      fastify.ready(err => {
        t.error(err)

        fastify.view('templates/index.marko', data, (err, compiled) => {
          t.error(err)
          const markoLoaded = marko.load('./templates/index.marko', opts).renderToString(data)
          t.strictEqual(markoLoaded, compiled)
          fastify.close()
        })
      })
    })
  })
})

test('fastify.view with marko should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const marko = require('marko')

  fastify.register(require('../index'), {
    engine: {
      marko: marko
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view(null, {}, err => {
      t.ok(err instanceof Error)
      t.is(err.message, 'Missing page')
      fastify.close()
    })
  })
})

test('reply.view with marko engine should return 500 if renderToString fails', t => {
  t.plan(4)
  const fastify = Fastify()
  const marko = {
    load: () => ({
      renderToString: (_, callback) => { callback(Error('RenderToString Error')) }
    })
  }

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
      const { message } = JSON.parse(body.toString())
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual('RenderToString Error', message)

      fastify.close()
    })
  })
})
