'use strict'

require('./setup.js')({
  engine: { ejs: require('ejs') },
  route: (req, reply) => { return reply.viewAsync('index.ejs', { text: 'text' }) }
})
