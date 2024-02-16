'use strict'

require('./setup.js')({
  engine: { pug: require('pug') },
  route: (req, reply) => { reply.view('index.pug', { text: 'text' }) }
})
