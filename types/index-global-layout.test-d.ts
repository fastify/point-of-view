import fastify from 'fastify'
import fastifyView, { FastifyViewOptions } from '..'
import { expectAssignable } from 'tsd'
import * as path from 'node:path'

interface Locals {
  appVersion: string,
}

declare module 'fastify' {
  interface FastifyReply {
    locals: Partial<Locals> | undefined
  }
}
const app = fastify()

app.register(fastifyView, {
  engine: {
    ejs: require('ejs'),
  },
  templates: 'templates',
  includeViewExtension: true,
  defaultContext: {
    dev: true,
  },
  options: {},
  charset: 'utf-8',
  layout: 'layout-ts',
  maxCache: 100,
  production: false,
  root: path.resolve(__dirname, '../templates'),
  viewExt: 'ejs',
})

app.get('/', (_request, reply) => {
  reply.view('/layout-ts-content-no-data')
})

app.get('/data', (_request, reply) => {
  if (!reply.locals) {
    reply.locals = {}
  }

  // reply.locals.appVersion = 1 // not a valid type
  reply.locals.appVersion = '4.14.0'
  reply.view('/layout-ts-content-with-data', { text: 'Sample data' })
})

app.get('/dataTyped', (_request, reply) => {
  if (!reply.locals) {
    reply.locals = {}
  }

  // reply.locals.appVersion = 1 // not a valid type
  reply.locals.appVersion = '4.14.0'
  reply.view<{ text: string; }>('/layout-ts-content-with-data', { text: 'Sample data' })
})

app.listen({ port: 3000 }, (err, address) => {
  if (err) throw err
  console.log(`server listening on ${address} ...`)
})

expectAssignable<FastifyViewOptions>({ engine: { twig: require('twig') }, propertyName: 'mobile' })
