'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('fs')
const path = require('path')
const minifier = require('html-minifier')
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

test('fastify.view exist', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('./index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.ready(err => {
    t.error(err)
    t.ok(fastify.view)

    fastify.close()
  })
})

test('reply.view exist', t => {
  t.plan(6)
  const fastify = Fastify()

  fastify.register(require('./index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.get('/', (req, reply) => {
    t.ok(reply.view)
    reply.send({ hello: 'world' })
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
      t.deepEqual(JSON.parse(body), { hello: 'world' })
      fastify.close()
    })
  })
})

test('reply.view should return 500 if page is missing', t => {
  t.plan(3)
  const fastify = Fastify()

  fastify.register(require('./index'), {
    engine: {
      ejs: require('ejs')
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view()
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      fastify.close()
    })
  })
})

test('register callback should throw if the engine is missing', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('./index'))

  fastify.ready(err => {
    t.ok(err instanceof Error)
    t.is(err.message, 'Missing engine')
  })
})

test('register callback should throw if the engine is not supported', t => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(require('./index'), {
    engine: {
      notSupported: null
    }
  }).ready(err => {
    t.ok(err instanceof Error)
    t.is(err.message, '\'notSupported\' not yet supported, PR? :)')
  })
})

test('fastify.view with handlebars engine', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('/templates/index.html', data).then(compiled => {
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine and html-minifier', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      handlebars: handlebars
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('/templates/index.html', data).then(compiled => {
      t.strictEqual(minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), minifierOpts), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine and callback', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('/templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine with callback and html-minifier', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      handlebars: handlebars
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('/templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), minifierOpts), compiled)
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and custom templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('/index.ejs', data)
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
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and full path templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    templates: path.join(__dirname, 'templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('/index.ejs', data)
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
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.ejs', data)
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
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.ejs', data)
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
      t.strictEqual(minifier.minify(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      pug: pug
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.pug', data)
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
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      pug: pug
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.pug', data)
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
      t.strictEqual(minifier.minify(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.html', data)
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
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      handlebars: handlebars
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.html', data)
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
      t.strictEqual(minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.html', data)
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

test('reply.view with mustache engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.html', data)
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
      t.strictEqual(minifier.minify(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { 'body': './templates/body.mustache' } })
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
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { 'body': '<p>{{ text }}</p>' }), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine with partials and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { 'body': './templates/body.mustache' } })
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
      t.strictEqual(minifier.minify(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { 'body': '<p>{{ text }}</p>' }), minifierOpts), replyBody.toString())
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

  fastify.register(require('./index'), {
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

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    },
    templates: templatesFolder
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.mustache', data, { partials: { 'body': 'body.mustache' } })
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
      t.strictEqual(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { 'body': '<p>{{ text }}</p>' }), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with mustache engine, missing template file', t => {
  t.plan(5)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/missing.html', data)
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

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/missing.mustache', data, { partials: { 'body': './templates/body.mustache' } })
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

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { 'body': './templates/missing.mustache' } })
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

  fastify.register(require('./index'), {
    engine: {
      mustache: mustache
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { 'body': './templates/missing.mustache', 'footer': './templates/alsomissing.mustache' } })
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

test('reply.view with marko engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      marko: marko
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.marko', data)
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
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with marko engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      marko: marko
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.marko', data)
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
      t.strictEqual(minifier.minify(marko.load('./templates/index.marko').renderToString(data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with marko engine, with stream', t => {
  t.plan(5)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      marko: marko
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.marko', data, { stream: true })
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/octet-stream')
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with marko engine, with stream and html-minify-stream', t => {
  t.plan(5)
  const fastify = Fastify()
  const marko = require('marko')
  const data = { text: 'text' }
  const htmlMinifyStream = require('html-minify-stream')

  fastify.register(require('./index'), {
    engine: {
      marko: marko
    },
    options: {
      useHtmlMinifyStream: htmlMinifyStream,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.marko', data, { stream: true })
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/octet-stream')
      t.strictEqual(minifier.minify(marko.load('./templates/index.marko').renderToString(data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with pug engine, will preserve content-type', t => {
  t.plan(6)
  const fastify = Fastify()
  const pug = require('pug')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      pug: pug
    }
  })

  fastify.get('/', (req, reply) => {
    reply.header('Content-Type', 'text/xml')
    reply.view('/templates/index.pug', data)
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
      t.strictEqual(response.headers['content-type'], 'text/xml')
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs-mate engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejsMate = require('ejs-mate')
  const data = { text: 'text', header: 'header', footer: 'footer' }

  fastify.register(require('./index'), {
    engine: {
      'ejs-mate': ejsMate
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/content.ejs', data)
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
      t.strictEqual('<html><head></head><body><h1>header</h1><div>text</div><div>footer</div></body></html>', body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs-mate engine and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejsMate = require('ejs-mate')
  const data = { text: 'text', header: 'header', footer: 'footer' }

  fastify.register(require('./index'), {
    engine: {
      'ejs-mate': ejsMate
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/content.ejs', data)
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
      t.strictEqual(minifier.minify('<html><head></head><body><h1>header</h1><div>text</div><div>footer</div></body></html>', minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine and custom templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      nunjucks: nunjucks
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('/index.njk', data)
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
      // Global Nunjucks templates dir changed here.
      t.strictEqual(nunjucks.render('./index.njk', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine and full path templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      nunjucks: nunjucks
    },
    templates: path.join(__dirname, 'templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('/index.njk', data)
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
      // Global Nunjucks templates dir changed here.
      t.strictEqual(nunjucks.render('./index.njk', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine, full path templates folder, and html-minifier', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      nunjucks: nunjucks
    },
    templates: path.join(__dirname, 'templates'),
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/index.njk', data)
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
      // Global Nunjucks templates dir changed here.
      t.strictEqual(minifier.minify(nunjucks.render('./index.njk', data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine and includeViewExtension is true', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      nunjucks: nunjucks
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index', data)
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
      // Global Nunjucks templates dir is  `./` here.
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine using onConfigure callback', t => {
  t.plan(7)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      nunjucks: nunjucks
    },
    options: {
      onConfigure: env => {
        env.addGlobal('myGlobalVar', 'my global var value')
      }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index-with-global.njk', data)
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
      // Global Nunjucks templates dir is  `./` here.
      t.strictEqual(nunjucks.render('./templates/index-with-global.njk', data), body.toString())
      t.match(body.toString(), /.*<p>my global var value<\/p>/)
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and includeViewExtension property as true', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index', data)
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
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, template folder specified, include files (ejs and html) used in template, includeViewExtension property as true', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder), // needed for include files to be resolved in include directive ...
    views: [__dirname] // must be put to make tests (with include files) working ...
  }
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-linking-other-pages', data) // sample for specifying with type
    // reply.view('index-with-includes', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-linking-other-pages.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.strictEqual(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; home', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.strictEqual(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with no data', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/no-data-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-no-data')
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/no-data-test'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-no-data.ejs', null, options, function (err, str) {
        content = str
        t.error(err)
        t.strictEqual(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with includes', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/include-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-test'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'text/html; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.strictEqual(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with one include missing', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/include-one-include-missing-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-one-missing', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-one-include-missing-test'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes-one-missing.ejs', data, options, function (err, str) {
        content = str
        t.type(err, Error) // expected Error here ...
        t.strictEqual(content, undefined)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with one attribute missing', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options: options
  })

  fastify.get('/include-one-attribute-missing-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-and-attribute-missing', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-one-attribute-missing-test'
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 500)
      t.strictEqual(response.headers['content-type'], 'application/json; charset=utf-8')
      t.strictEqual(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes-and-attribute-missing.ejs', data, options, function (err, str) {
        content = str
        t.type(err, Error) // expected Error here ...
        t.strictEqual(content, undefined)
      })

      fastify.close()
    })
  })
})

test('reply.view with handlebars engine and includeViewExtension property as true', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      handlebars: handlebars
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index', data)
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
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('fastify.view with ejs engine and callback in production mode', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      ejs: ejs
    },
    production: true
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('/templates/index.ejs', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('/templates/index.ejs', data, (err, compiled) => {
          t.error(err)
          t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), compiled)
          fastify.close()
        })
      })
    })
  })
})

test('fastify.view with handlebars engine and callback in production mode', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      handlebars: handlebars
    },
    production: true
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('/templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('/templates/index.html', data, (err, compiled) => {
          t.error(err)
          t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
          fastify.close()
        })
      })
    })
  })
})
