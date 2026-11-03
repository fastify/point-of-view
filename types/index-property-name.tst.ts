import fastify from 'fastify'
import { FastifyReply } from 'fastify'
import fastifyView, {
  type FastifyViewAsyncReplyDecorator,
  type FastifyViewDecorators,
  type FastifyViewInstanceDecorator,
  type FastifyViewInstanceProperty,
  type FastifyViewReplyDecorator,
  type FastifyViewReplyProperty,
} from '..'
import { expect } from 'tstyche'

declare module 'fastify' {
  interface FastifyReply extends FastifyViewReplyProperty<'render' | 'mobile' | 'desktop', 'renderAsync' | 'viewAsPromise' | 'mobileAsync' | 'desktopAsync'> {}
  interface FastifyInstance extends FastifyViewInstanceProperty<'render' | 'mobile' | 'desktop'> {}
}

expect<keyof FastifyViewDecorators<'render'>['reply']>().type.toBe<'render' | 'renderAsync'>()
expect<keyof FastifyViewDecorators<'render'>['instance']>().type.toBe<'render'>()
expect<keyof FastifyViewReplyProperty<'mobile' | 'desktop'>>().type.toBe<'mobile' | 'desktop' | 'mobileAsync' | 'desktopAsync'>()
expect<keyof FastifyViewReplyProperty<'render', 'viewAsPromise'>>().type.toBe<'render' | 'viewAsPromise'>()
expect<keyof FastifyViewInstanceProperty<'render'>>().type.toBe<'render'>()

expect<FastifyViewDecorators<'render'>['instance']['render']>().type.toBe<FastifyViewInstanceDecorator>()
expect<FastifyViewDecorators<'render'>['reply']['render']>().type.toBe<FastifyViewReplyDecorator>()
expect<FastifyViewDecorators<'render'>['reply']['renderAsync']>().type.toBe<FastifyViewAsyncReplyDecorator>()

const app = fastify()

app.register(fastifyView, {
  engine: {
    ejs: require('ejs'),
  },
  propertyName: 'render',
})

app.register(fastifyView, {
  engine: {
    ejs: require('ejs'),
  },
  propertyName: 'mobile',
})

app.register(fastifyView, {
  engine: {
    ejs: require('ejs'),
  },
  propertyName: 'desktop',
})

app.get('/render', (_request, reply) => {
  expect(reply.render).type.toBeCallableWith('/index', { text: 'Sample data' })
  expect(reply.render).type.toBeCallableWith('/index')
  expect(reply.render<{ text: string; }>).type.toBeCallableWith('/index', { text: 'Sample data' })
  expect(reply.render<{ text: string; }>).type.not.toBeCallableWith('/index', { notText: 'Sample data' })

  expect(reply.render('/index', { text: 'Sample data' })).type.toBe<FastifyReply>()
  return reply.render('/index', { text: 'Sample data' })
})

app.get('/render-async', async (_request, reply) => {
  expect(reply.renderAsync).type.toBeCallableWith('/index', { text: 'Sample data' })
  expect(reply.renderAsync).type.toBeCallableWith('/index')
  expect(reply.renderAsync<{ text: string; }>).type.toBeCallableWith('/index', { text: 'Sample data' })
  expect(reply.renderAsync<{ text: string; }>).type.not.toBeCallableWith('/index', { notText: 'Sample data' })

  const html = await reply.renderAsync('/index', { text: 'Sample data' })
  expect(html).type.toBe<string>()
  return html
})

app.get('/custom-async-name', async (_request, reply) => {
  const html = await reply.viewAsPromise('/index', { text: 'Sample data' })
  expect(html).type.toBe<string>()
  return html
})

app.get('/mobile', (_request, reply) => {
  expect(reply.mobile('/templates/index.ejs', { text: 'text' })).type.toBe<FastifyReply>()
  return reply.mobile('/templates/index.ejs', { text: 'text' })
})

app.get('/desktop', async (_request, reply) => {
  const html = await reply.desktopAsync('/templates/index.ejs', { text: 'text' })
  expect(html).type.toBe<string>()
  return html
})

expect(app.render('/index', { text: 'Sample data' })).type.toBe<Promise<string>>()
expect(app.render.clearCache).type.toBeCallableWith()
expect(app.mobile.clearCache).type.toBeCallableWith()
expect(app.desktop('/templates/index.ejs', { text: 'text' })).type.toBe<Promise<string>>()
