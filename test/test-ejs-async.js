'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('node:fs')
const minifier = require('html-minifier-terser')

test('reply.view with ejs engine and async: true (global option)', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: { async: true },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, async: true (global option), and production: true', t => {
  const numTests = 2
  t.plan(numTests * 5 + 1)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: { async: true },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs')
  })

  fastify.listen({ port: 0 }, async err => {
    t.error(err)

    for (let i = 0; i < numTests; i++) {
      await new Promise((resolve, reject) => {
        sget({
          method: 'GET',
          url: 'http://localhost:' + fastify.server.address().port
        }, async (err, response, body) => {
          t.error(err)
          t.equal(response.statusCode, 200)
          t.equal(response.headers['content-length'], '' + body.length)
          t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
          t.equal(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), body.toString())
          if (i === numTests - 1) fastify.close()
          resolve()
        })
      })
    }
  })
})

const minifierOpts = { collapseWhitespace: true }
test('reply.view with ejs engine, async: true (global option), and html-minifier-terser', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, async: true (global option), and html-minifier without option', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: true,
      useHtmlMinifier: minifier
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true })), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, async: true (global option), and html-minifier in production mode', t => {
  const numTests = 3
  t.plan(numTests * 5 + 1)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs')
  })

  fastify.listen({ port: 0 }, async err => {
    t.error(err)

    for (let i = 0; i < numTests; i++) {
      await new Promise((resolve, reject) => {
        sget({
          method: 'GET',
          url: 'http://localhost:' + fastify.server.address().port
        }, async (err, response, body) => {
          t.error(err)
          t.equal(response.statusCode, 200)
          t.equal(response.headers['content-length'], '' + body.length)
          t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
          t.equal(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), body.toString())
          if (i === numTests - 1) fastify.close()
          resolve()
        })
      })
    }
  })
})

test('reply.view with ejs engine and async: true (local option)', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs', {}, { async: true })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, async: true (local option), and production: true', t => {
  const numTests = 5
  t.plan(numTests * 5 + 1)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs', {}, { async: true })
  })

  fastify.listen({ port: 0 }, async err => {
    t.error(err)

    for (let i = 0; i < numTests; i++) {
      await new Promise((resolve, reject) => {
        sget({
          method: 'GET',
          url: 'http://localhost:' + fastify.server.address().port
        }, async (err, response, body) => {
          t.error(err)
          t.equal(response.statusCode, 200)
          t.equal(response.headers['content-length'], '' + body.length)
          t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
          t.equal(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), body.toString())
          if (i === numTests - 1) fastify.close()
          resolve()
        })
      })
    }
  })
})

test('reply.view with ejs engine, async: true (local override), and html-minifier-terser', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: false,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs', {}, { async: true })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), { }, { async: true }), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, async: false (local override), and html-minifier-terser', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.ejs', { text: 'text' }, { async: false })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await minifier.minify(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), { text: 'text' }, { async: false }), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, async: true (local override), and html-minifier-terser in production mode', t => {
  const numTests = 3
  t.plan(numTests * 5 + 1)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: {
      async: false,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('ejs-async.ejs', {}, { async: true })
  })

  fastify.listen({ port: 0 }, async err => {
    t.error(err)

    for (let i = 0; i < numTests; i++) {
      await new Promise((resolve, reject) => {
        sget({
          method: 'GET',
          url: 'http://localhost:' + fastify.server.address().port
        }, async (err, response, body) => {
          t.error(err)
          t.equal(response.statusCode, 200)
          t.equal(response.headers['content-length'], '' + body.length)
          t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
          t.equal(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), body.toString())
          if (i === numTests - 1) fastify.close()
          resolve()
        })
      })
    }
  })
})

test('reply.view with ejs engine, async: false (local override), and html-minifier-terser in production mode', t => {
  const numTests = 2
  t.plan(numTests * 5 + 1)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.ejs', { text: 'text' }, { async: false })
  })

  fastify.listen({ port: 0 }, async err => {
    t.error(err)

    for (let i = 0; i < numTests; i++) {
      await new Promise((resolve, reject) => {
        sget({
          method: 'GET',
          url: 'http://localhost:' + fastify.server.address().port
        }, async (err, response, body) => {
          t.error(err)
          t.equal(response.statusCode, 200)
          t.equal(response.headers['content-length'], '' + body.length)
          t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
          t.equal(await minifier.minify(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), { text: 'text' }, { async: false }), minifierOpts), body.toString())
          if (i === numTests - 1) fastify.close()
          resolve()
        })
      })
    }
  })
})

test('reply.view with ejs engine and async: true and raw template', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs }
  })

  fastify.get('/', (req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/ejs-async.ejs', 'utf8') }, {}, { async: true })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and async: true and function template', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs }
  })

  fastify.get('/', (req, reply) => {
    reply.view(ejs.compile(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), { async: true }), {})
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with promise error', t => {
  t.plan(3)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs }
  })

  fastify.get('/', (req, reply) => {
    reply.view(() => Promise.reject(new Error('error')), {})
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      fastify.close()
    })
  })
})

test('reply.viewAsync with ejs engine and async: true (global option)', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: { async: true },
    templates: 'templates'
  })

  fastify.get('/', async (req, reply) => {
    return reply.viewAsync('ejs-async.ejs')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), body.toString())
      fastify.close()
    })
  })
})

test('reply.viewAsync with ejs engine, async: true (global option), and html-minifier-terser', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: { ejs },
    options: {
      async: true,
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    return reply.viewAsync('ejs-async.ejs')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await minifier.minify(await ejs.render(fs.readFileSync('./templates/ejs-async.ejs', 'utf8'), {}, { async: true }), minifierOpts), body.toString())
      fastify.close()
    })
  })
})
