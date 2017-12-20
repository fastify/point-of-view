'use strict'

const t = require('tap')
const test = t.test
const request = require('request')
const Fastify = require('fastify')
const fs = require('fs')
const path = require('path')

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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.deepEqual(JSON.parse(body), { hello: 'world' })
      fastify.close()
    })
  })
})

test('reply.view should return 500 if some data is missing', t => {
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
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

  fastify.register(require('./index'), {}, err => {
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
  }, err => {
    t.ok(err instanceof Error)
    t.is(err.message, '\'notSupported\' not yet supported, PR? :)')
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-type'], 'application/octet-stream')
      t.strictEqual(marko.load('./templates/index.marko').renderToString(data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/xml')
      t.strictEqual(pug.render(fs.readFileSync('./templates/index.pug', 'utf8'), data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual('<html><head></head><body><h1>header</h1><div>text</div><div>footer</div></body></html>', body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body)
      fastify.close()
    })
  })
})

test('reply.view with nunjucks engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const nunjucks = require('nunjucks')
  const data = { text: 'text' }

  fastify.register(require('./index'), {
    engine: {
      nunjucks: nunjucks
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('/templates/index.njk', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(nunjucks.render('./templates/index.njk', data), body)
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

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.strictEqual(response.statusCode, 200)
      t.strictEqual(response.headers['content-length'], '' + body.length)
      t.strictEqual(response.headers['content-type'], 'text/html')
      t.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body)
      fastify.close()
    })
  })
})
