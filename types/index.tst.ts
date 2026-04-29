import fastify from 'fastify'
import fastifyView, { type FastifyViewOptions } from '..'
import { expect } from 'tstyche'
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
  maxCache: 100,
  production: false,
  root: path.resolve(__dirname, '../templates'),
  viewExt: 'ejs',
})

app.get('/', (_request, reply) => {
  reply.view('/index-with-no-data')
})

app.get('/data', (_request, reply) => {
  if (!reply.locals) {
    reply.locals = {}
  }

  expect(reply.locals?.appVersion).type.toBe<string | undefined>()

  reply.view('/index', { text: 'Sample data' })
})

app.get('/dataTyped', (_request, reply) => {
  if (!reply.locals) {
    reply.locals = {}
  }

  expect(reply.locals?.appVersion).type.toBe<string | undefined>()

  reply.view<{ text: string; }>('/index', { text: 'Sample data' })
})

app.get('/use-layout', (_request, reply) => {
  reply.view('/layout-ts-content-with-data', { text: 'Using a layout' }, { layout: '/layout-ts' })
})

app.get('/view-async', async (_request, reply) => {
  expect(reply.locals?.appVersion).type.toBe<string | undefined>()

  expect(reply.viewAsync).type.toBeCallableWith('/index', { text: 'Sample data' })
  expect(reply.viewAsync).type.toBeCallableWith('/index', { notText: 'Sample data' })
  expect(reply.viewAsync).type.toBeCallableWith('/index')

  const html = await reply.viewAsync('/index', { text: 'Sample data' })
  expect(html).type.toBe<string>()
  return html
})

app.get('/view-async-generic-provided', async (_request, reply) => {
  expect(reply.viewAsync<{ text: string; }>).type.toBeCallableWith('/index', { text: 'Sample data' })
  expect(reply.viewAsync<{ text: string; }>).type.not.toBeCallableWith('/index', { notText: 'Sample data' })

  const html = reply.viewAsync<{ text: string; }>('/index', { text: 'Sample data' })
  expect(html).type.toBe<Promise<string>>()
  return html
})

expect(app.view('/index', {}, { layout: '/layout-ts' })).type.toBe<Promise<string>>()

expect<FastifyViewOptions>().type.toBeAssignableFrom({ engine: { twig: require('twig') }, propertyName: 'mobile' })

const nunjucksApp = fastify()

nunjucksApp.register(fastifyView, {
  engine: {
    nunjucks: require('nunjucks'),
  },
  templates: [
    'templates/nunjucks-layout',
    'templates/nunjucks-template'
  ],
})

nunjucksApp.get('/', (_request, reply) => {
  reply.view('index.njk', { text: 'Sample data' })
})

expect(nunjucksApp.view('/', { text: 'Hello world' })).type.toBe<Promise<string>>()

expect<FastifyViewOptions>().type.toBeAssignableFrom({ engine: { nunjucks: require('nunjucks') }, templates: 'templates' })

expect<FastifyViewOptions>().type.toBeAssignableFrom({ engine: { nunjucks: require('nunjucks') }, templates: ['templates/nunjucks-layout', 'templates/nunjucks-template'] })
