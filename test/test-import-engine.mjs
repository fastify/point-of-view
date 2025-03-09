import Fastify from 'fastify'
import fs from 'node:fs'
import get from 'simple-get'
import t from 'tap'
const test = t.test
const sget = get.concat

test('using an imported engine as a promise', t => {
  t.plan(3)
  const fastify = Fastify()
  const data = { text: 'text' }
  const ejs = import('ejs')

  fastify.register(import('../index.js'), { engine: { ejs }, templates: 'templates' })

  fastify.get('/', (_req, reply) => {
    reply.view('index.ejs', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.assert.ifError(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, _response, body) => {
      t.assert.ifError(err)
      t.assert.strictEqual((await ejs).render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})
