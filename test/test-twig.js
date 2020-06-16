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

test('reply.view with twig engine', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view with twig engine and simple include', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/template.twig', data)
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
      Twig.renderFile('./templates/template.twig', data, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view for twig without data-parameter but defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.twig')
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
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view for twig without data-parameter and without defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.twig')
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
      Twig.renderFile('./templates/index.twig', (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view with twig engine and defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.twig', {})
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
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view for twig engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.twig')
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
      Twig.renderFile('./templates/index.twig', localsData, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view for twig engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view for twig engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.twig')
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
      Twig.renderFile('./templates/index.twig', localsData, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view for twig engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view with twig engine and html-minifier', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.error(err)
        t.strictEqual(minifier.minify(html, minifierOpts), body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view with twig engine, will preserve content-type', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/xml')
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/xml')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.error(err)
        t.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})
