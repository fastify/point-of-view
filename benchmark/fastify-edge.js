'use strict'

const { Edge } = require('edge.js')
const { join } = require('node:path')
const edge = new Edge()
edge.mount(join(__dirname, '..', 'templates'))

require('./setup.js')({
  engine: { edge },
  route: (_req, reply) => {
    reply.view('index.edge', { text: 'text' })
  }
})
