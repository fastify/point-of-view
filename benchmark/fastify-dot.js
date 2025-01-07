'use strict'

require('./setup.js')({
  engine: { dot: require('dot') },
  route: (_req, reply) => { reply.view('testdot', { text: 'text' }) }
})
