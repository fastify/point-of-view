'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const { join } = require('node:path')

require('./helper').liquidHtmlMinifierTests(true)
require('./helper').liquidHtmlMinifierTests(false)

test('reply.view with liquid engine', async t => {
  t.plan(4)
  const fastify = Fastify()
  const { Edge } = require('edge.js')
  const data = { text: 'text' }

  const engine = new Edge()
  engine.mount(join(__dirname, '..', 'templates'))

  fastify.register(require('../index'), {
    engine: {
      edge: engine
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.edge', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  const html = await engine.render('index.edge', data)
  t.assert.strictEqual(html, responseContent)

  await fastify.close()
})
