import t from 'tap'
import get from 'simple-get'
import Fastify from 'fastify'
import fs from 'node:fs'
const test = t.test
const sget = get.concat

test('using an imported engine as a promise', t => {
  t.plan(3)
  const fastify = Fastify()
  const data = { text: 'text' }
  const ejs = import('ejs')

  fastify.register(import('../index.js'), { engine: { ejs }, templates: 'templates' })

  fastify.get('/', (req, reply) => {
    reply.view('index.ejs', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal((await ejs).render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})
