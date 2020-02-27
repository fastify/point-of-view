'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('fs')
const minifier = require('html-minifier')
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

test('fastify.view with handlebars engine', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data).then(compiled => {
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view for handlebars without data-parameter but defaultContext', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    defaultContext: data
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html').then(compiled => {
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('fastify.view for handlebars without data-parameter and without defaultContext', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html').then(compiled => {
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine and defaultContext', t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    defaultContext: data
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', {}).then(compiled => {
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

  fastify.register(require('../index'), {
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

    fastify.view('./templates/index.html', data).then(compiled => {
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

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data, (err, compiled) => {
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

  fastify.register(require('../index'), {
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

    fastify.view('./templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), minifierOpts), compiled)
      fastify.close()
    })
  })
})

test('fastify.view with handlebars engine with layout option', t => {
  t.plan(3)

  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'it works!' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index-for-layout.hbs', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), compiled)
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
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
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine catches render error', t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  handlebars.registerHelper('badHelper', () => { throw new Error('kaboom') })

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/error.hbs')
  })

  fastify.inject({
    method: 'GET',
    url: '/'
  }, (err, res) => {
    t.error(err)
    t.strictEqual(JSON.parse(res.body).message, 'kaboom')
    t.strictEqual(res.statusCode, 500)
  })
})

test('reply.view with handlebars engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
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

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
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
      t.strictEqual(minifier.minify(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and includeViewExtension property as true', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs: ejs
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index', data)
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

  fastify.register(require('../index'), {
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

  fastify.register(require('../index'), {
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

test('reply.view with handlebars engine and includeViewExtension property as true', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index', data)
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

test('fastify.view with handlebars engine and callback in production mode', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    production: true
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./templates/index.html', data, (err, compiled) => {
      t.error(err)
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('./templates/index.html', data, (err, compiled) => {
          t.error(err)
          t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
          fastify.close()
        })
      })
    })
  })
})

test('reply.view with handlebars engine with partials', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    options: {
      partials: { body: './templates/body.hbs' }
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
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
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'))(data), replyBody.toString())
      fastify.close()
    })
  })
})

test('reply.view with handlebars engine with layout option', t => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars: handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-for-layout.hbs', data)
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
      t.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), replyBody.toString())
      fastify.close()
    })
  })
})
