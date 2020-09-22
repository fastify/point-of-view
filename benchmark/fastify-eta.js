'use strict'
var path = require('path')

process.env.NODE_ENV = 'production'

const fastify = require('fastify')()

fastify.register(require('../index'), {
  engine: {
    eta: require('eta')
  },
  root: path.join(__dirname, '../templates'),
  options: {
    cache: true
  }
})

fastify.get('/', (req, reply) => {
  reply.view('index.eta', { text: 'text' })
})

fastify.listen(3000, (err) => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
