'use strict'

require('./setup.js')({
  engine: { ejs: require('ejs') },
  route: (req, reply) => { reply.view('index-for-layout.ejs', { text: 'text' }, { layout: 'layout.html' }) }
})
