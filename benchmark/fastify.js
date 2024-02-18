'use strict'

require('./setup.js')({
  engine: { ejs: require('ejs') },
  route: (req, reply) => { reply.view('index.ejs', { text: 'text' }) }
})
