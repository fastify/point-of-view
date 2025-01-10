'use strict'

require('./setup.js')({
  engine: { ejs: require('ejs') },
  route: (_req, reply) => { reply.view('index.ejs', { text: 'text' }) }
})
