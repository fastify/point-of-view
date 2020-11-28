'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const path = require('path')

require('./helper').nunjucksHtmlMinifierTests(t, true)
require('./helper').nunjucksHtmlMinifierTests(t, false)

test('reply.view with nunjucks engine and custom templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.njk', data)
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
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body.toString())
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
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.njk')
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
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body.toString())
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
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.njk')
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
      t.strictEqual(nunjucks.render('./templates/index.njk'), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for nunjucks engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.njk')
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
      t.strictEqual(nunjucks.render('./templates/index.njk', localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for nunjucks engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.njk', data)
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
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for nunjucks engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.njk')
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
      t.strictEqual(nunjucks.render('./templates/index.njk', localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for nunjucks engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.njk', data)
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
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body.toString())
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

test('fastify.view with nunjucks engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('templates/index.njk', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(nunjucks.render('./templates/index.njk', data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('templates/index.njk', data, (err, compiled) => {
          t.error(err)
          t.strictEqual(nunjucks.render('./templates/index.njk', data), compiled)
          fastify.close()
        })
      })
    })
  })
})

test('fastify.view with nunjucks should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
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

test('fastify.view with nunjucks engine should return 500 if render fails', t => {
  t.plan(4)
  const fastify = Fastify()
  const nunjucks = {
    configure: () => ({
      render: (_, __, callback) => { callback(Error('Render Error')) }
    })
  }

  fastify.register(require('../index'), {
    engine: {
      nunjucks: nunjucks
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.njk')
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
      t.strictEqual('Render Error', message)

      fastify.close()
    })
  })
})
