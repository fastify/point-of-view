'use strict'

process.env.NODE_ENV = 'production'

const fastify = require('fastify')()

fastify.register(require('../index'), {
  engine: {
    ejs: require('ejs')
  },
  layout: '../templates/layout.html'
})

fastify.get('/', (req, reply) => {
  reply.view('../templates/index-for-layout.ejs', { text: 'text' })
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
