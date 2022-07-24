import fastify from "fastify";
import pointOfView, { PointOfViewOptions } from "..";
import { expectAssignable } from "tsd";
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

app.register(pointOfView, {
  engine: {
    ejs: require("ejs"),
  },
  templates: "templates",
  includeViewExtension: true,
  defaultContext: {
    dev: true,
  },
  options: {},
  layout: "layout",
  charset: "utf-8",
  maxCache: 100,
  production: false,
  root: path.resolve(__dirname, "../templates"),
  viewExt: "ejs",
});

app.get("/", (request, reply) => {
  reply.view("/index-with-no-data", {header: "Header", footer: "Footer"});
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

// Global layout setting and per route layout are mutually exclusive
/*
app.get("/alt-layout", (request, reply) => {
  reply.view("/alt-layout-content", {text: "Alt layout"}, {layout: "/alt-layout"})
});
*/

app.listen({port: 3000}, (err, address) => {
  if (err) throw err
  console.log(`server listening on ${address} ...`)
})

expectAssignable<PointOfViewOptions>({ engine: { twig: require('twig') }, propertyName: 'mobile' })
