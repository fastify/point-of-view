'use strict'

const { test } = require('node:test')
const fs = require('node:fs')
const Fastify = require('fastify')

require('./helper').twigHtmlMinifierTests(true)
require('./helper').twigHtmlMinifierTests(false)

test('reply.view with twig engine', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with twig engine and simple include', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/template.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view for twig without data-parameter but defaultContext', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view for twig without data-parameter and without defaultContext', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with twig engine and defaultContext', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view for twig engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', localsData, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view for twig engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view for twig engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', localsData, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view for twig engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with twig engine, will preserve content-type', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/xml')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('fastify.view with twig engine, should throw page missing', (t, end) => {
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
      end()
    })
  })
})

test('reply.view with twig engine should return 500 if renderFile fails', async t => {
  t.plan(2)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(JSON.parse(responseContent).message, 'RenderFile Error')

  await fastify.close()
})

test('reply.view with twig engine and raw template', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with twig engine and function template', async t => {
  t.plan(5)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  await new Promise(resolve => {
    Twig.renderFile('./templates/index.twig', data, (err, html) => {
      t.assert.ifError(err)
      t.assert.strictEqual(html, responseContent)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with twig engine and unknown template type', async t => {
  t.plan(1)
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

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})
