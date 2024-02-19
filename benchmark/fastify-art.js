'use strict'

require('./setup.js')({
  engine: { 'art-template': require('art-template') },
  route: (req, reply) => { reply.view('index.art', { text: 'text' }) }
})
