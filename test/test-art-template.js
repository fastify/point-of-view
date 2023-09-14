'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('node:fs')
const path = require('node:path')

test('reply.view with art-template engine and custom templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art', data)
  })

  fastify.listen({ port: 10086 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for art-template without data-parameter and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art')
  })

  fastify.listen({ port: 10086 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, {}), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for art-template without data-parameter but with defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art')
  })

  fastify.listen({ port: 10086 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with art-template engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates',
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art', {})
  })

  fastify.listen({ port: 10086 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for art-template engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.art')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for art-template engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.art', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for art-template engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.art')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for art-template engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.art', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with art-template engine and full path templates folder', t => {
  t.plan(6)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: path.join(__dirname, '..', 'templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('./index.art', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with art-template engine and includeViewExtension is true', t => {
  t.plan(6)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with art-template engine and full path templates folder', t => {
  t.plan(6)

  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: path.join(__dirname, '..', 'templates')
  })

  fastify.get('/', (req, reply) => {
    fastify.view('./index', data, (err, html) => {
      t.error(err)
      reply.send(html)
    })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/plain; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with art-template should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const art = require('art-template')

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view(null, {}, err => {
      t.ok(err instanceof Error)
      t.equal(err.message, 'Missing page')
      fastify.close()
    })
  })
})

test('reply.view with art-template should return 500 if render fails', t => {
  t.plan(4)
  const fastify = Fastify()
  const art = {
    compile: () => { throw Error('Compile Error') }
  }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      const { message } = JSON.parse(body.toString())
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal('Compile Error', message)

      fastify.close()
    })
  })
})

test('reply.view with art-template engine and raw template', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.art') }, data)
  })

  fastify.listen({ port: 10086 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with art-template engine and function template', t => {
  t.plan(6)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/html').view(art.compile({ filename: path.join(__dirname, '..', 'templates', 'index.art') }), data)
  })

  fastify.listen({ port: 10086 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html')

      const templatePath = path.join(__dirname, '..', 'templates', 'index.art')

      t.equal(art(templatePath, data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with art-template engine and unknown template type', t => {
  t.plan(3)
  const fastify = Fastify()
  const art = require('art-template')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      'art-template': art
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view({}, data)
  })

  fastify.listen({ port: 10086 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://127.0.0.1:10086/'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      fastify.close()
    })
  })
})
