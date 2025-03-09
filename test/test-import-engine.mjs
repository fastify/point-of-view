import Fastify from 'fastify'
import fs from 'node:fs'
import { test } from 'node:test'

test('using an imported engine as a promise', async t => {
  t.plan(1)
  const fastify = Fastify()
  const data = { text: 'text' }
  const ejs = import('ejs')

  fastify.register(import('../index.js'), { engine: { ejs }, templates: 'templates' })

  fastify.get('/', (_req, reply) => {
    reply.view('index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual((await ejs).render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), await result.text())
  fastify.close()
})
