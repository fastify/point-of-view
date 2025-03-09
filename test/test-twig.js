'use strict'

const { test } = require('node:test')
const sget = require('simple-get').concat
const fs = require('node:fs')
const Fastify = require('fastify')

require('./helper').twigHtmlMinifierTests(true)
require('./helper').twigHtmlMinifierTests(false)

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
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/template.twig', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/template.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.twig')
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.twig')
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.twig', {})
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.twig')
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', localsData, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
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
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.twig')
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', localsData, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
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
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
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

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/xml')
    reply.view('./templates/index.twig', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/xml')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('fastify.view with twig engine, should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const Twig = require('twig')

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view(null, {}, err => {
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(err.message, 'Missing page')
      fastify.close()
    })
  })
})

test('reply.view with twig engine should return 500 if renderFile fails', t => {
  t.plan(4)
  const fastify = Fastify()
  const Twig = {
    renderFile: (_, __, callback) => { callback(Error('RenderFile Error')) }
  }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.twig')
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      const { message } = JSON.parse(body.toString())
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 500)
      t.assert.strictEqual('RenderFile Error', message)

      fastify.close()
    })
  })
})

test('reply.view with twig engine and raw template', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.twig') }, data)
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view with twig engine and function template', t => {
  t.plan(7)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view(Twig.twig({ data: fs.readFileSync('./templates/index.twig').toString() }), data)
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      Twig.renderFile('./templates/index.twig', data, (err, html) => {
        t.assert.ifError(err)
        t.assert.strictEqual(html, body.toString())
      })
      fastify.close()
    })
  })
})

test('reply.view with twig engine and unknown template type', t => {
  t.plan(3)
  const fastify = Fastify()
  const Twig = require('twig')
  const data = { title: 'fastify', text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      twig: Twig
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ }, data)
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 500)
      fastify.close()
    })
  })
})
