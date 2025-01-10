'use strict'

require('./setup.js')({
  engine: { pug: require('pug') },
  route: (_req, reply) => { reply.view('index.pug', { text: 'text' }) }
})
