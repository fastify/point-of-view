'use strict'

const fastify = require('fastify')()

fastify.register(require('..'), {
  engine: {
    ejs: require('ejs')
  }
})

fastify.get('/', (_req, reply) => {
  reply.view('/templates/index.ejs', { text: 'text' })
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
