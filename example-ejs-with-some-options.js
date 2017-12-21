'use strict'

const fastify = require('fastify')()
const resolve = require('path').resolve
const templatesFolder = 'templates'
const data = { text: 'text' }

fastify.register(require('./index'), {
  engine: {
    ejs: require('ejs')
  },
  includeViewExtension: true,
  templates: templatesFolder,
  options: {
    filename: resolve(templatesFolder)
  }
})

fastify.get('/', (req, reply) => {
  reply.view('index', data)
})

fastify.get('/include-test', (req, reply) => {
  reply.view('index-with-includes', data)
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
