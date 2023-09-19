'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const { existsSync, rmdirSync, readFileSync } = require('node:fs')
const { join } = require('node:path')
const pino = require('pino')
const split = require('split2')
const compileOptions = {
  path: 'templates',
  destination: 'out',
  log: false
}

require('./helper').dotHtmlMinifierTests(t, compileOptions, true)
require('./helper').dotHtmlMinifierTests(t, compileOptions, false)

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
      t.equal(body.toString(), engine.process({ path: 'templates', destination: 'out' }).testdot(data))
      fastify.close()
    })
  })
})

test('reply.view with dot engine .dot file should create non-existent destination', t => {
  t.plan(2)
  const fastify = Fastify()
  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    options: {
      destination: 'non-existent'
    }
  })

  t.teardown(() => rmdirSync('non-existent'))

  fastify.get('/', (req, reply) => {
    reply.view('testdot')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    t.ok(existsSync('non-existent'))
    fastify.close()
  })
})

test('reply.view with dot engine .dot file should log WARN if template not found', t => {
  t.plan(2)
  const splitStream = split(JSON.parse)
  splitStream.on('data', (line) => {
    t.equal(line.msg, `WARN: no template found in ${join(__dirname, '..')}`)
  })
  const logger = pino({ level: 'warn' }, splitStream)
  const fastify = Fastify({
    logger
  })
  const engine = require('dot')
  engine.log = false

  t.teardown(() => rmdirSync('empty'))

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    options: {
      destination: 'empty'
    }
  })

  fastify.listen({ port: 0 }, err => {
    t.equal(err, err)
    fastify.close()
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
      engine.process(compileOptions)
      t.equal(body.toString(), require('../out/testjst')(data))
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
      t.equal(body.toString(), engine.process(compileOptions).testdot(data))
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
      engine.process(compileOptions)
      t.equal(body.toString(), engine.process(compileOptions).testdot())
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
      t.equal(body.toString(), engine.process(compileOptions).testdot(data))
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
      t.equal(body.toString(), engine.process(compileOptions).testdot(localsData))
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
      t.equal(body.toString(), engine.process(compileOptions).testdot(data))
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
      t.equal(body.toString(), engine.process(compileOptions).testdot(localsData))
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
      t.equal(body.toString(), engine.process(compileOptions).testdot(data))
      fastify.close()
    })
  })
})

test('fastify.view with dot engine, should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
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

test('reply.view with dot engine with layout option', t => {
  t.plan(6)
  const fastify = Fastify()
  const engine = require('dot')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates',
    layout: 'layout'
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot', data)
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
      t.equal('header: textfoo text1 <p>foo</p>footer', body.toString())
      fastify.close()
    })
  })
})

test('reply.view with dot engine with layout option on render', t => {
  t.plan(6)
  const fastify = Fastify()
  const engine = require('dot')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot', data, { layout: 'layout' })
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
      t.equal('header: textfoo text1 <p>foo</p>footer', body.toString())
      fastify.close()
    })
  })
})

test('reply.view with dot engine with layout option on render', t => {
  t.plan(6)
  const fastify = Fastify()
  const engine = require('dot')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot', data, { layout: 'layout' })
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
      t.equal('header: textfoo text1 <p>foo</p>footer', body.toString())
      fastify.close()
    })
  })
})

test('reply.view should return 500 if layout is missing on render', t => {
  t.plan(3)
  const fastify = Fastify()
  const engine = require('dot')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('testdot', data, { layout: 'non-existing-layout' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      fastify.close()
    })
  })
})

test('reply.view with dot engine and raw template', t => {
  t.plan(6)
  const fastify = Fastify()
  const data = { text: 'text' }
  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view({ raw: readFileSync('./templates/testdot.dot'), imports: { testdef: readFileSync('./templates/testdef.def') } }, data)
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
      t.equal(body.toString(), engine.process({ path: 'templates', destination: 'out' }).testdot(data))
      fastify.close()
    })
  })
})

test('reply.view with dot engine and function template', t => {
  t.plan(6)
  const fastify = Fastify()
  const data = { text: 'text' }
  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    }
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/html').view(engine.process({ path: 'templates', destination: 'out' }).testdot, data)
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
      t.equal(response.headers['content-type'], 'text/html')
      t.equal(body.toString(), engine.process({ path: 'templates', destination: 'out' }).testdot(data))
      fastify.close()
    })
  })
})
