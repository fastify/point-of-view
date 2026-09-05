import fastify from 'fastify'
import fastifyView from '..'

const app = fastify()

app.register(fastifyView, {
  engine: {
    ejs: require('ejs'),
  },
  templates: 'templates',
  propertyName: 'render',
})

app.get('/', (_request, reply) => {
  reply.render('/index-with-no-data')
})

app.get('/async', async (_request, reply) => {
  return reply.renderAsync('/index-with-no-data')
})

app.get('/instance', async () => {
  return app.render('/index-with-no-data')
})
