'use strict'

require('./setup.js')({
  engine: { dot: require('dot') },
  route: (req, reply) => { reply.view('testdot', { text: 'text' }) }
})
