'use strict'

const { Eta } = require('eta')
const eta = new Eta()

require('./setup.js')({
  engine: { eta },
  route: (req, reply) => { reply.view('index.eta', { text: 'text' }) }
})
