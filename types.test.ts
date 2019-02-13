import fastify = require("fastify");
import pointOfView = require("./");

const app = fastify();

app.register<pointOfView.PointOfViewOptions>(pointOfView, {
  engine: {
    ejs: require("ejs"),
  },
  templates: "templates",
});

app.get("/", (request, reply) => {
  reply.view("/index.ejs");
});

app.get("/data", (request, reply) => {
  reply.view("/data.ejs", { data: "data" });
});
