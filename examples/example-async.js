'use strict'

const { promisify } = require('node:util')
const sleep = promisify(setTimeout)
const templates = 'templates'

const fastify = require('fastify')({
  logger: true
})

fastify.register(require('..'), {
  engine: {
    nunjucks: require('nunjucks')
  },
  templates
})

async function something () {
  await sleep(1000)
  return new Date()
}

fastify.get('/', async (_req, reply) => {
  const t = await something()
  return reply.view('/index.njk', { text: t })
})

fastify.listen({ port: 3000 }, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
