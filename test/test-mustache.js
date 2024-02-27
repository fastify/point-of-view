'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('node:fs')
const minifier = require('html-minifier-terser')
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

test('reply.view with mustache engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for mustache without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for mustache without data-parameter and without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (req, reply) => {
    // Reusing the ejs-template is possible because it contains no tags
    reply.view('./templates/index-bare.html')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index-bare.html', 'utf8')), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', {})
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for mustache engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for mustache engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for mustache engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for mustache engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials in production mode should use cache', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }
  const POV = require('..')

  fastify.decorate(POV.fastifyViewCache, {
    get: () => {
      return '<div>Cached Response</div>'
    },
    set: () => { }
  })

  fastify.register(POV, {
    engine: {
      mustache
    },
    production: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], String(replyBody.length))
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal('<div>Cached Response</div>', replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials in production mode should cache partials correctly', t => {
  t.plan(11)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }
  const POV = require('..')

  fastify.register(POV, {
    engine: {
      mustache
    },
    production: true
  })

  fastify.get('/one', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/partial-1.mustache' } })
  })
  fastify.get('/two', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/partial-2.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: `http://localhost:${fastify.server.address().port}/one`
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], String(replyBody.length))
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      t.match(replyBody.toString(), /Partial 1 - b4d932b9-4baa-4c99-8d14-d45411b9361e/g)
    })

    sget({
      method: 'GET',
      url: `http://localhost:${fastify.server.address().port}/two`
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], String(replyBody.length))
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')

      t.match(replyBody.toString(), /Partial 2 - fdab0fe2-6dab-4429-ae9f-dfcb791d1d3d/g)
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials and html-minifier-terser', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, async (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(await minifier.minify(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), minifierOpts), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials and paths excluded from html-minifier-terser', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts,
      pathsToExcludeHtmlMinifier: ['/test']
    }
  })

  fastify.get('/test', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/test'
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine, template folder specified', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }
  const templatesFolder = 'templates'

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    templates: templatesFolder
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.html', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine, template folder specified with partials', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }
  const templatesFolder = 'templates'

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    templates: templatesFolder
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.mustache', data, { partials: { body: 'body.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + replyBody.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine, missing template file', t => {
  t.plan(5)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('../templates/missing.html', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)
      fastify.close()
    })
  })
})

test('reply.view with mustache engine, with partials missing template file', t => {
  t.plan(5)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/missing.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)
      fastify.close()
    })
  })
})

test('reply.view with mustache engine, with partials missing partials file', t => {
  t.plan(5)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/missing.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)
      fastify.close()
    })
  })
})

test('reply.view with mustache engine, with partials and multiple missing partials file', t => {
  t.plan(5)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/missing.mustache', footer: './templates/alsomissing.mustache' } })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)
      fastify.close()
    })
  })
})

test('fastify.view with mustache engine, should throw page missing', t => {
  t.plan(3)
  const fastify = Fastify()
  const mustache = require('mustache')

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view(null, {}, err => {
      t.ok(err instanceof Error)
      t.equal(err.message, 'Missing page')
      fastify.close()
    })
  })
})
test('reply.view for mustache and raw template', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.html', 'utf8') })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for mustache and function template', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/html').view((mustache.render.bind(mustache, fs.readFileSync('./templates/index.html', 'utf8'))))
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html')
      t.equal(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})
