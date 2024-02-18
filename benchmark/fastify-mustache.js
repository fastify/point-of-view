'use strict'

require('./setup.js')({
  engine: { mustache: require('mustache') },
  route: (req, reply) => { reply.view('index.html', { text: 'text' }) }
})
