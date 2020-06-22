import fastify from "fastify";
import pointOfView, {PointOfViewOptions} from "..";
import {expectAssignable} from "tsd";
import * as path from "path";

const app = fastify();

app.register(pointOfView, {
  engine: {
    handlebars: require("handlebars"),
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
  reply.view("/index-with-no-data");
});

app.get("/data", (request, reply) => {
  reply.view("/index", { text: "Sample data" });
});

app.listen(3000, (err, address) => {
  if (err) throw err
  console.log(`server listening on ${address} ...`)
})

expectAssignable<PointOfViewOptions>({engine: {twig: require('twig') } })
