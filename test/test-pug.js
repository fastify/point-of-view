'use strict'

const { test } = require('node:test')
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('node:fs')

require('./helper').pugHtmlMinifierTests(true)
require('./helper').pugHtmlMinifierTests(false)

test('reply.view with pug engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
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
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], '' + body.length)
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine in production mode should use cache', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const POV = require('..')

  fastify.decorate(POV.fastifyViewCache, {
    get: () => {
      return () => '<div>Cached Response</div>'
    },
    set: () => { }
  })

  fastify.register(POV, {
    engine: {
      pug
    },
    production: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 200)
      t.assert.strictEqual(response.headers['content-length'], String(body.length))
      t.assert.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.assert.strictEqual('<div>Cached Response</div>', body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine and includes', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/sample.pug', data)
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
      t.assert.strictEqual(pug.renderFile('./templates/sample.pug', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug without data-parameter and without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8')), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug', {})
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug', data)
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for pug engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug', data)
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine, will preserve content-type', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/xml')
    reply.view('./templates/index.pug', data)
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with pug engine, should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug
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

test('reply.view with pug engine, should throw error if non existent template path', t => {
  t.plan(5)
  const fastify = Fastify()
  const pug = require('pug')

  fastify.register(require('../index'), {
    engine: {
      pug
    },
    templates: 'non-existent'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./test/index.html')
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual(response.statusCode, 500)
      t.assert.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      t.assert.strictEqual(response.headers['content-length'], String(body.length))
      fastify.close()
    })
  })
})

test('reply.view with pug engine should return 500 if compile fails', t => {
  t.plan(4)
  const fastify = Fastify()
  const pug = {
    compile: () => { throw Error('Compile Error') }
  }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.pug')
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
      t.assert.strictEqual('Compile Error', message)

      fastify.close()
    })
  })
})

test('reply.view with pug engine and raw template', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.pug', 'utf8') }, data)
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine and function template', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      pug
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view(pug.compile(fs.readFileSync('./templates/index.pug', 'utf8')), data)
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
      t.assert.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})
