'use strict'

const { test } = require('node:test')
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

require('./helper').dotHtmlMinifierTests(compileOptions, true)
require('./helper').dotHtmlMinifierTests(compileOptions, false)

test('reply.view with dot engine .dot file', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('testdot', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(responseContent, engine.process({ path: 'templates', destination: 'out' }).testdot(data))

  await fastify.close()
})

test('reply.view with dot engine .dot file should create non-existent destination', async t => {
  t.plan(1)
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

  t.after(() => rmdirSync('non-existent'))

  fastify.get('/', (_req, reply) => {
    reply.view('testdot')
  })

  await fastify.listen({ port: 0 })

  t.assert.ok(existsSync('non-existent'))

  await fastify.close()
})

test('reply.view with dot engine .dot file should log WARN if template not found', async t => {
  t.plan(1)
  const splitStream = split(JSON.parse)
  splitStream.on('data', (line) => {
    t.assert.strictEqual(line.msg, `WARN: no template found in ${join(__dirname, '..')}`)
  })
  const logger = pino({ level: 'warn' }, splitStream)
  const fastify = Fastify({
    loggerInstance: logger
  })
  const engine = require('dot')
  engine.log = false

  t.after(() => rmdirSync('empty'))

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    options: {
      destination: 'empty'
    }
  })

  await fastify.listen({ port: 0 })
  await fastify.close()
})

test('reply.view with dot engine .jst file', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('testjst', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  engine.process(compileOptions)
  t.assert.strictEqual(responseContent, require('../out/testjst')(data))

  await fastify.close()
})

test('reply.view with dot engine without data-parameter but defaultContext', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('testdot')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(responseContent, engine.process(compileOptions).testdot(data))

  await fastify.close()
})

test('reply.view with dot engine without data-parameter but without defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()

  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('testdot')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  engine.process(compileOptions)
  t.assert.strictEqual(responseContent, engine.process(compileOptions).testdot())

  await fastify.close()
})

test('reply.view with dot engine with data-parameter and defaultContext', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('testdot', {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(responseContent, engine.process(compileOptions).testdot(data))

  await fastify.close()
})

test('reply.view for dot engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('testdot', {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(responseContent, engine.process(compileOptions).testdot(localsData))

  await fastify.close()
})

test('reply.view for dot engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
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
  t.assert.strictEqual(responseContent, engine.process(compileOptions).testdot(data))

  await fastify.close()
})

test('reply.view for dot engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('testdot')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(responseContent, engine.process(compileOptions).testdot(localsData))

  await fastify.close()
})

test('reply.view for dot engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
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
  t.assert.strictEqual(responseContent, engine.process(compileOptions).testdot(data))

  await fastify.close()
})

test('fastify.view with dot engine, should throw page missing', (t, end) => {
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
    t.assert.ifError(err)

    fastify.view(null, {}, err => {
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(err.message, 'Missing page')
      fastify.close()
      end()
    })
  })
})

test('reply.view with dot engine with layout option', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('testdot', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('header: textfoo text1 <p>foo</p>footer', responseContent)

  await fastify.close()
})

test('reply.view with dot engine with layout option on render', async t => {
  t.plan(4)
  const fastify = Fastify()
  const engine = require('dot')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('testdot', data, { layout: 'layout' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('header: textfoo text1 <p>foo</p>footer', responseContent)

  await fastify.close()
})

test('reply.view with dot engine with layout option on render', async t => {
  t.plan(4)
  const fastify = Fastify()
  const engine = require('dot')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('testdot', data, { layout: 'layout' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('header: textfoo text1 <p>foo</p>footer', responseContent)

  await fastify.close()
})

test('reply.view should return 500 if layout is missing on render', async t => {
  t.plan(1)
  const fastify = Fastify()
  const engine = require('dot')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    },
    root: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('testdot', data, { layout: 'non-existing-layout' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.view with dot engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const data = { text: 'text' }
  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: readFileSync('./templates/testdot.dot'), imports: { testdef: readFileSync('./templates/testdef.def') } }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(responseContent, engine.process({ path: 'templates', destination: 'out' }).testdot(data))

  await fastify.close()
})

test('reply.view with dot engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const data = { text: 'text' }
  const engine = require('dot')
  engine.log = false

  fastify.register(require('../index'), {
    engine: {
      dot: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/html').view(engine.process({ path: 'templates', destination: 'out' }).testdot, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html')
  t.assert.strictEqual(responseContent, engine.process({ path: 'templates', destination: 'out' }).testdot(data))

  await fastify.close()
})
