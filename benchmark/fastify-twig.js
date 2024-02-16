'use strict'

require('./setup.js')({
  engine: { twig: require('twig') },
  route: (req, reply) => { reply.view('index.twig', { title: 'fastify', text: 'text' }) }
})
