'use strict'

const t = require('tap')
const test = t.test
const sget = require('simple-get').concat
const Fastify = require('fastify')
const fs = require('node:fs')
const path = require('node:path')
const minifier = require('html-minifier-terser')
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}

test('reply.view with ejs engine and custom templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine with layout option', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates'),
    layout: 'layout.html'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine with layout option on render', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.ejs', data, { layout: 'layout.html' })
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view should return 500 if layout is missing on render', t => {
  t.plan(3)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }
  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.ejs', data, { layout: 'non-existing-layout.html' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and custom ext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    templates: 'templates',
    viewExt: 'ejs'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for ejs without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.ejs')
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for ejs without data-parameter but defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    defaultContext: data,
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.ejs')
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for ejs without data-parameter and without defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    templates: 'templates'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-bare.html')
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
      t.equal(ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8')), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for ejs engine without data-parameter and defaultContext but with reply.locals', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
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
      t.equal(ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for ejs engine without defaultContext but with reply.locals and data-parameter', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-bare.html', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for ejs engine without data-parameter but with reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
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
      t.equal(ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), body.toString())
      fastify.close()
    })
  })
})

test('reply.view for ejs engine with data-parameter and reply.locals and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    defaultContext: contextData
  })

  fastify.addHook('preHandler', function (request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (req, reply) => {
    reply.view('./templates/index-bare.html', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and full path templates folder', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    templates: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('index.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('templates/index.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and defaultContext', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    defaultContext: data
  })

  fastify.get('/', (req, reply) => {
    reply.view('templates/index.ejs', {})
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and html-minifier-terser', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('templates/index.ejs', data)
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
      t.equal(await minifier.minify(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), minifierOpts), body.toString())
      fastify.close()
    })
  })
})
test('reply.view with ejs engine and paths excluded from html-minifier-terser', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts,
      pathsToExcludeHtmlMinifier: ['/test']
    }
  })

  fastify.get('/test', (req, reply) => {
    reply.view('templates/index.ejs', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})
test('reply.view with ejs engine and html-minifier-terser in production mode', t => {
  const numTests = 5
  t.plan(numTests * 5 + 1)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: { ejs },
    production: true,
    options: {
      useHtmlMinifier: minifier,
      htmlMinifierOptions: minifierOpts
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view('templates/index.ejs', data)
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
          t.equal(await minifier.minify(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), minifierOpts), body.toString())
          if (i === numTests - 1) fastify.close()
          resolve()
        })
      })
    }
  })
})

test('reply.view with ejs engine and includeViewExtension property as true', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true
  })

  fastify.get('/', (req, reply) => {
    reply.view('templates/index', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('*** reply.view with ejs engine with layout option, includeViewExtension property as true ***', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }
  const header = ''
  const footer = ''

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    defaultContext: {
      header,
      footer
    },
    includeViewExtension: true,
    root: path.join(__dirname, '../templates'),
    layout: 'layout-with-includes'
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), {
        ...data,
        header,
        footer
      }), body.toString())
      fastify.close()
    })
  })
})

test('*** reply.view with ejs engine with layout option on render, includeViewExtension property as true ***', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }
  const header = ''
  const footer = ''

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    defaultContext: {
      header,
      footer
    },
    includeViewExtension: true,
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    reply.view('index-for-layout.ejs', data, { layout: 'layout-with-includes' })
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), {
        ...data,
        header,
        footer
      }), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine, template folder specified, include files (ejs and html) used in template, includeViewExtension property as true', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('node:path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder), // needed for include files to be resolved in include directive ...
    views: [__dirname] // must be put to make tests (with include files) working ...
  }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: templatesFolder
    // Options not necessary now
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-linking-other-pages', data) // sample for specifying with type
    // reply.view('index-with-includes', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-linking-other-pages.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.equal(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; home', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('node:path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.equal(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with no data', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('node:path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/no-data-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-no-data')
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/no-data-test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-no-data.ejs', null, options, function (err, str) {
        content = str
        t.error(err)
        t.equal(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with includes', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('node:path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [path.join(__dirname, '..')]
  }

  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/include-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes.ejs', data, options, function (err, str) {
        content = str
        t.error(err)
        t.equal(content.length, body.length)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with one include missing', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('node:path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/include-one-include-missing-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-one-missing', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-one-include-missing-test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes-one-missing.ejs', data, options, function (err, str) {
        content = str
        t.type(err, Error) // expected Error here ...
        t.equal(content, undefined)
      })

      fastify.close()
    })
  })
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with one attribute missing', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('node:path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),
    views: [__dirname]
  }
  const data = { text: 'Hello from EJS Templates' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true,
    templates: templatesFolder,
    options
  })

  fastify.get('/include-one-attribute-missing-test', (req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-and-attribute-missing', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/include-one-attribute-missing-test'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      t.equal(response.headers['content-type'], 'application/json; charset=utf-8')
      t.equal(response.headers['content-length'], '' + body.length)

      let content = null
      ejs.renderFile(templatesFolder + '/index-with-includes-and-attribute-missing.ejs', data, options, function (err, str) {
        content = str
        t.type(err, Error) // expected Error here ...
        t.equal(content, undefined)
      })

      fastify.close()
    })
  })
})

test('fastify.view with ejs engine, missing template file', t => {
  t.plan(3)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('./missing.html', {}, err => {
      t.ok(err instanceof Error)
      t.equal(err.message, `ENOENT: no such file or directory, open '${path.join(__dirname, '../missing.html')}'`)
      fastify.close()
    })
  })
})

test('fastify.view with ejs engine and callback in production mode', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    production: true
  })

  fastify.ready(err => {
    t.error(err)

    fastify.view('templates/index.ejs', data, (err, compiled) => {
      t.error(err)
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), compiled)

      fastify.ready(err => {
        t.error(err)

        fastify.view('templates/index.ejs', data, (err, compiled) => {
          t.error(err)
          t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), compiled)
          fastify.close()
        })
      })
    })
  })
})

test('reply.view with ejs engine and raw template', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.ejs', 'utf8') }, data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and function template', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', (req, reply) => {
    reply.view(ejs.compile(fs.readFileSync('./templates/index.ejs', 'utf8')), data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.view with ejs engine and failed call to render when onError hook defined', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/invalid', (req, reply) => {
    // Note the mistake in the ternary statement -- the second `?` should be a `:`
    reply.view({
      raw: '<p><%= true ? "text" ? "text2" %></p>'
    })
  })

  fastify.get('/valid', (req, reply) => {
    reply.view({
      raw: '<%= true ? "text" : "text2" %>'
    })
  })

  // when onError hook is defined, certain errors (such as calls to reply.send inside the `onError` hook) are uncaught
  fastify.addHook('onError', async (request, reply, err) => {})

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    // request route with invalid template, followed by route with valid template
    // in order to ensure server does not crash after first request
    sget({
      method: 'GET',
      url: `http://localhost:${fastify.server.address().port}/invalid`
    }, (err, response) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      sget({
        method: 'GET',
        url: `http://localhost:${fastify.server.address().port}/valid`
      }, (err, response, body) => {
        t.error(err)
        t.equal('text', body.toString())
        t.equal(response.statusCode, 200)
        fastify.close()
      })
    })
  })
})

test('reply.viewAsync with ejs engine - sync handler', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', async (req, reply) => {
    return reply.viewAsync('templates/index.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.viewAsync with ejs engine - async handler', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', (req, reply) => {
    return reply.viewAsync('templates/index.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.viewAsync should return 500 if layout is missing on render', t => {
  t.plan(3)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }
  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    return reply.viewAsync('index-for-layout.ejs', data, { layout: 'non-existing-layout.html' })
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 500)
      fastify.close()
    })
  })
})

test('reply.viewAsync should allow errors to be handled by custom error handler', t => {
  t.plan(7)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }
  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (req, reply) => {
    return reply.viewAsync('index-for-layout.ejs', data, { layout: 'non-existing-layout.html' })
  })

  fastify.setErrorHandler((err, request, reply) => {
    t.ok(err instanceof Error)
    t.same(reply.getHeader('Content-Type'), null)
    return 'something went wrong'
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)
    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.headers['content-type'], 'text/plain; charset=utf-8')
      t.equal(response.statusCode, 200)
      t.equal('something went wrong', body.toString())
      fastify.close()
    })
  })
})

test('reply.viewAsync with ejs engine and custom propertyName', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    propertyName: 'render'
  })

  fastify.get('/', async (req, reply) => {
    return reply.renderAsync('templates/index.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.viewAsync with ejs engine and custom asyncPropertyName', t => {
  t.plan(6)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    asyncPropertyName: 'viewAsPromise'
  })

  fastify.get('/', async (req, reply) => {
    return reply.viewAsPromise('templates/index.ejs', data)
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
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      fastify.close()
    })
  })
})

test('reply.viewAsync with ejs engine and custom asyncPropertyName and custom propertyName', t => {
  t.plan(11)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    asyncPropertyName: 'renderPromise',
    propertyName: 'oldRenderSend'
  })

  fastify.get('/asyncPropertyName', async (req, reply) => {
    return reply.renderPromise('templates/index.ejs', data)
  })

  fastify.get('/propertyName', (req, reply) => {
    reply.oldRenderSend('templates/index.ejs', data)
  })

  fastify.listen({ port: 0 }, err => {
    t.error(err)

    sget({
      method: 'GET',
      url: 'http://localhost:' + fastify.server.address().port + '/asyncPropertyName'
    }, (err, response, body) => {
      t.error(err)
      t.equal(response.statusCode, 200)
      t.equal(response.headers['content-length'], '' + body.length)
      t.equal(response.headers['content-type'], 'text/html; charset=utf-8')
      t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body.toString())
      sget({
        method: 'GET',
        url: 'http://localhost:' + fastify.server.address().port + '/propertyName'
      }, (err2, response2, body2) => {
        t.error(err2)
        t.equal(response2.statusCode, 200)
        t.equal(response2.headers['content-length'], '' + body.length)
        t.equal(response2.headers['content-type'], 'text/html; charset=utf-8')
        t.equal(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), body2.toString())
        fastify.close()
      })
    })
  })
})

test('reply.viewAsync with ejs engine and conflicting propertyName/asyncPropertyName', t => {
  t.plan(1)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    propertyName: 'render',
    asyncPropertyName: 'render'
  })

  fastify.listen({ port: 0 }, err => {
    t.ok(err instanceof Error)
  })
})
