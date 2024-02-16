'use strict'

require('./setup.js')({
  engine: { ejs: require('ejs') },
  route: (req, reply) => { reply.view('ejs-async.ejs', { text: 'text' }) },
  options: { async: true }
})
