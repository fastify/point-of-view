const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('fs')

test('reply.view with ejs engine and async: true', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: { async: true },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), body.toString())
      fastify.close()
    })
  })
})
