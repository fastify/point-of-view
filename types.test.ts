import fastify = require("fastify");
import pointOfView = require("./");

const app = fastify();

app.register(pointOfView, {
  engine: {
    ejs: require("ejs"),
  },
  templates: "templates",
});

app.get("/", (request, reply) => {
  reply.view("/index-with-no-data.ejs");
});

app.get("/data", (request, reply) => {
  reply.view("/index.ejs", { text: "Sample data" });
});

app.listen(3000, (err, address) => {
  if (err) throw err
  console.log(`server listening on ${address} ...`)
})
