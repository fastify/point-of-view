'use strict'

require('./setup.js')({
  engine: { nunjucks: require('nunjucks') },
  route: (req, reply) => { reply.view('index.njk', { text: 'text' }) }
})
