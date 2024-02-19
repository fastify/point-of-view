'use strict'

const { Liquid } = require('liquidjs')
const liquid = new Liquid()

require('./setup.js')({
  engine: { liquid },
  route: (req, reply) => { reply.view('index.liquid', { text: 'text' }) }
})
