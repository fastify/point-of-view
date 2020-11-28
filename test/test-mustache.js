'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('fs')
const minifier = require('html-minifier')
const proxyquire = require('proxyquire')
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
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
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
      mustache: mustache
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
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
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    // Reusing the ejs-template is possible because it contains no tags
    reply.view('./templates/index-bare.html')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index-bare.html', 'utf8')), body.toString())
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
      mustache: mustache
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', {})
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
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
      mustache: mustache
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), localsData), body.toString())
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
      mustache: mustache
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.html', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
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
      mustache: mustache
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

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), localsData), body.toString())
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
      mustache: mustache
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

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
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
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + replyBody.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials in production mode should use cache', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }
  const POV = proxyquire('..', {
    hashlru: function () {
      return {
        get: () => {
          return '<div>Cached Response</div>'
        },
        set: () => { }
      }
    }
  })

  fastify.register(POV, {
    engine: {
      mustache: mustache
    },
    production: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], String(replyBody.length))
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual('<div>Cached Response</div>', replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache: mustache
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + replyBody.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(minifier.minify(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), minifierOpts), replyBody.toString())
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
      mustache: mustache
    },
    templates: templatesFolder
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.html', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), body.toString())
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
      mustache: mustache
    },
    templates: templatesFolder
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.mustache', data, { partials: { body: 'body.mustache' } })
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, replyBody) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + replyBody.length)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), replyBody.toString())
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
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('../templates/missing.html', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)
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
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/missing.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)
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
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/missing.mustache' } })
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)
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
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/missing.mustache', footer: './templates/alsomissing.mustache' } })
  })

  fastify.listen(0, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)
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
      mustache: mustache
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view(null, {}, err => {
      t.ok(err instanceof Error)
      t.is(err.message, 'Missing page')
      fastify.close()
    })
  })
})
