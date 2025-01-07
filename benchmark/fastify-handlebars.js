'use strict'

require('./setup.js')({
  engine: { handlebars: require('handlebars') },
  route: (_req, reply) => { reply.view('index.html', { text: 'text' }) }
})
