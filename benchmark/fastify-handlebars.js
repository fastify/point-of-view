'use strict'

require('./setup.js')({
  engine: { handlebars: require('handlebars') },
  route: (req, reply) => { reply.view('index.html', { text: 'text' }) }
})
