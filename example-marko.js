'use strict'

const fastify = require('fastify')()
const resolve = require('path').resolve
const templatesFolder = 'templates'
const marko = require('marko')

const data = { text: 'marko' }

const templateSrc = `
<!DOCTYPE html>
<html lang="en">
  <head></head>
  <body>
    <p>\${data.text} from memory</p>
  </body>
</html>
`

// To ask marko compile template from pre-loaded template for example from a web editor
// Pass the template as property templateSrc of opts
// The page parameter still should be passed and its path should exist in so that marko engine
// could lookup components along the parent path.

const opts = { templateSrc }

fastify.register(require('./index'), {
  engine: {
    marko
  },
  includeViewExtension: true,
  templates: templatesFolder,
  options: {
    filename: resolve(templatesFolder)
  },
  charset: 'utf-8' // sample usage, but specifying the same value already used as default
})

// Load template from memory
// Web page should show text: marko from memory

fastify.get('/mem', (req, reply) => {
  reply.view('mem', data, opts)
})

// Load template from file system
// Web page should show text: marko

fastify.get('/file', (req, reply) => {
  reply.view('index', data)
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
