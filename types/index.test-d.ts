import fastify from "fastify";
import fastifyView, { PointOfViewOptions, FastifyViewOptions } from "..";
import { expectAssignable, expectDeprecated, expectType } from "tsd";
import * as path from "path";

interface Locals {
  appVersion: string,
}

declare module "fastify" {
  interface FastifyReply {
    locals: Partial<Locals> | undefined
  }
}
const app = fastify();

app.register(fastifyView, {
  engine: {
    ejs: require("ejs"),
  },
  templates: "templates",
  includeViewExtension: true,
  defaultContext: {
    dev: true,
  },
  options: {},
  charset: "utf-8",
  maxCache: 100,
  production: false,
  root: path.resolve(__dirname, "../templates"),
  viewExt: "ejs",
});

app.get("/", (request, reply) => {
  reply.view("/index-with-no-data");
});

app.get("/data", (request, reply) => {
  if (!reply.locals) {
    reply.locals = {}
  }

  // reply.locals.appVersion = 1 // not a valid type
  reply.locals.appVersion = '4.14.0'
  reply.view("/index", { text: "Sample data" });
});

app.get("/dataTyped", (request, reply) => {
  if (!reply.locals) {
    reply.locals = {}
  }

  // reply.locals.appVersion = 1 // not a valid type
  reply.locals.appVersion = '4.14.0'
  reply.view<{ text: string; }>("/index", { text: "Sample data" });
});

app.get("/use-layout", (request, reply) => {
  reply.view("/layout-ts-content-with-data", {text: "Using a layout"}, {layout: "/layout-ts"})
});

app.listen({port: 3000}, (err, address) => {
  if (err) throw err
  console.log(`server listening on ${address} ...`)
})

expectType<Promise<string>>(app.view("/index", {}, { layout: "/layout-ts"}))

expectAssignable<FastifyViewOptions>({ engine: { twig: require('twig') }, propertyName: 'mobile' })

expectDeprecated({} as PointOfViewOptions)

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

nunjucksApp.get('/', (request, reply) => {
  reply.view('index.njk', { text: 'Sample data' })
})

expectType<Promise<string>>(nunjucksApp.view('/', { text: 'Hello world' }))

expectAssignable<FastifyViewOptions>({ engine: { nunjucks: require('nunjucks') }, templates: 'templates' })

expectAssignable<FastifyViewOptions>({ engine: { nunjucks: require('nunjucks') }, templates: ['templates/nunjucks-layout', 'templates/nunjucks-template']})
