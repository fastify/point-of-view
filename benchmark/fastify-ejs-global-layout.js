'use strict'

require('./setup.js')({
  engine: { ejs: require('ejs') },
  route: (req, reply) => { reply.view('index-for-layout.ejs', { text: 'text' }) },
  pluginOptions: {
    layout: 'layout.html'
  }
})
