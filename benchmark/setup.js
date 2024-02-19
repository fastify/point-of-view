'use strict'

process.env.NODE_ENV = 'production'

const fastify = require('fastify')()
const path = require('node:path')

module.exports = function ({ engine, route, options = {}, pluginOptions }) {
  fastify.register(require('../index'), {
    engine,
    options,
    root: path.join(__dirname, '../templates'),
    ...pluginOptions
  })

  fastify.get('/', route)

  fastify.listen({ port: 3000 }, err => {
    if (err) throw err
    console.log(`server listening on ${fastify.server.address().port}`)
  })

  return fastify
}
