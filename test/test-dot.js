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

const compileOptions = {
  path: 'templates',
  destination: 'out',
  log: false
}

test('reply.view with dot engine .dot file', t => {
  t.plan(6)
  const fastify = Fastify()
  const data = { text: 'text' }
  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(body.toString(), engine.process({ path: 'templates', destination: 'out' }).testdot(data))
      fastify.close()
    })
  })
})

test('reply.view with dot engine .jst file', t => {
  t.plan(6)
  const fastify = Fastify()
  const data = { text: 'text' }
  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('testjst', data)
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
      engine.process(compileOptions)
      t.strictEqual(body.toString(), require('../out/testjst')(data))
      fastify.close()
    })
  })
})

test('reply.view with dot engine without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const data = { text: 'text' }

  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    defaultContext: data,
    root: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot')
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
      t.strictEqual(body.toString(), engine.process(compileOptions).testdot(data))
      fastify.close()
    })
  })
})

test('reply.view with dot engine without data-parameter but without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()

  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot')
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
      engine.process(compileOptions)
      t.strictEqual(body.toString(), engine.process(compileOptions).testdot())
      fastify.close()
    })
  })
})

test('reply.view with dot engine with data-parameter and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const data = { text: 'text' }

  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    defaultContext: data,
    root: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot', {})
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
      t.strictEqual(body.toString(), engine.process(compileOptions).testdot(data))
      fastify.close()
    })
  })
})

test('reply.view for dot engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const localsData = { text: 'text from locals' }

  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot', {})
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
      t.strictEqual(body.toString(), engine.process(compileOptions).testdot(localsData))
      fastify.close()
    })
  })
})

test('reply.view for dot engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(body.toString(), engine.process(compileOptions).testdot(data))
      fastify.close()
    })
  })
})

test('reply.view for dot engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const localsData = { text: 'text from locals' }
  const defaultContext = { text: 'text' }

  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    defaultContext,
    root: 'templates'
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot')
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
      t.strictEqual(body.toString(), engine.process(compileOptions).testdot(localsData))
      fastify.close()
    })
  })
})

test('reply.view for dot engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const localsData = { text: 'text from locals' }
  const defaultContext = { text: 'text from context' }
  const data = { text: 'text' }

  const engine = require('dot')

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    defaultContext,
    root: 'templates'
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(body.toString(), engine.process(compileOptions).testdot(data))
      fastify.close()
    })
  })
})

test('reply.view with dot engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const data = { text: 'text' }

  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates',
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
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
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(body.toString(), minifier.minify(engine.process(compileOptions).testdot(data), minifierOpts))
      fastify.close()
    })
  })
})
