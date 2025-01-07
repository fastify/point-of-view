'use strict'

require('./setup.js')({
  engine: { twig: require('twig') },
  route: (_req, reply) => { reply.view('index.twig', { title: 'fastify', text: 'text' }) }
})
