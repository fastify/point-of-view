import fastify = require("fastify");
import pointOfView = require("../point-of-view");

const app = fastify();

app.register<pointOfView.PointOfViewOptions>(pointOfView, {
  engine: {
    ejs: require("ejs"),
  },
  templates: "templates",
});
