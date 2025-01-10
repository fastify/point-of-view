'use strict'

require('./setup.js')({
  engine: { 'art-template': require('art-template') },
  route: (_req, reply) => { reply.view('index.art', { text: 'text' }) }
})
