'use strict'

require('./setup.js')({
  engine: { squirrelly: require('squirrelly') },
  route: (_req, reply) => { reply.view('index.squirrelly', { text: 'text' }) }
})
