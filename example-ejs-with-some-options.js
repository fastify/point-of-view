'use strict'

const fastify = require('fastify')()
const resolve = require('path').resolve
const templatesFolder = 'templates'
const data = { text: 'Hello from EJS Templates' }

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
  reply.type('text/html; charset=utf-8').view('index', data)
})

fastify.get('/include-test', (req, reply) => {
  reply.type('text/html; charset=utf-8').view('index-with-includes', data)
})

fastify.get('/include-one-include-missing-test', (req, reply) => {
  reply.type('text/html; charset=utf-8').view('index-with-includes-one-missing', data)
})

fastify.get('/include-one-attribute-missing-test', (req, reply) => {
  reply.type('text/html; charset=utf-8').view('index-with-includes-and-attribute-missing', data)
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
