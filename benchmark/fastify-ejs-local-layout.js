'use strict'

require('./setup.js')({
  engine: { ejs: require('ejs') },
  route: (_req, reply) => { reply.view('index-for-layout.ejs', { text: 'text' }, { layout: 'layout.html' }) }
})
