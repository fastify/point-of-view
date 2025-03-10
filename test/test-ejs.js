'use strict'

const { test } = require('node:test')
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

test('reply.view with ejs engine and custom templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine with layout option', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine with layout option on render', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.ejs', data, { layout: 'layout.html' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view should return 500 if layout is missing on render', async t => {
  t.plan(1)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }
  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.ejs', data, { layout: 'non-existing-layout.html' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.view with ejs engine and custom ext', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for ejs without data-parameter but defaultContext', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('index.ejs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for ejs without data-parameter but defaultContext', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('index.ejs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for ejs without data-parameter and without defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    templates: 'templates'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index-bare.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8')), responseContent)

  await fastify.close()
})

test('reply.view for ejs engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for ejs engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for ejs engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), contextData), responseContent)

  await fastify.close()
})

test('reply.view for ejs engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-bare.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index-bare.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine and full path templates folder', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    templates: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    reply.view('index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.ejs', {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine and html-minifier-terser', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await minifier.minify(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), minifierOpts), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine and paths excluded from html-minifier-terser', async t => {
  t.plan(4)
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

  fastify.get('/test', (_req, reply) => {
    reply.view('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})
test('reply.view with ejs engine and html-minifier-terser in production mode', async t => {
  const numTests = 5
  t.plan(numTests * 4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  for (let i = 0; i < numTests; i++) {
    const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

    const responseContent = await result.text()

    t.assert.strictEqual(result.status, 200)
    t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
    t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
    t.assert.strictEqual(await minifier.minify(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), minifierOpts), responseContent)

    if (i === numTests - 1) fastify.close()
  }
})

test('reply.view with ejs engine and includeViewExtension property as true', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    includeViewExtension: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('templates/index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('*** reply.view with ejs engine with layout option, includeViewExtension property as true ***', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), {
    ...data,
    header,
    footer
  }), responseContent)

  await fastify.close()
})

test('*** reply.view with ejs engine with layout option on render, includeViewExtension property as true ***', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('index-for-layout.ejs', data, { layout: 'layout-with-includes' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), {
    ...data,
    header,
    footer
  }), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine, template folder specified, include files (ejs and html) used in template, includeViewExtension property as true', async t => {
  t.plan(5)
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

  fastify.get('/', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-linking-other-pages', data) // sample for specifying with type
    // reply.view('index-with-includes', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  await new Promise((resolve) => {
    ejs.renderFile(templatesFolder + '/index-linking-other-pages.ejs', data, options, function (err, str) {
      t.assert.ifError(err)
      t.assert.strictEqual(str.length, responseContent.length)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; home', async t => {
  t.plan(5)
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

  fastify.get('/', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  await new Promise((resolve) => {
    ejs.renderFile(templatesFolder + '/index.ejs', data, options, function (err, str) {
      t.assert.ifError(err)
      t.assert.strictEqual(str.length, responseContent.length)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with no data', async t => {
  t.plan(5)
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

  fastify.get('/no-data-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-no-data')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/no-data-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  await new Promise((resolve) => {
    ejs.renderFile(templatesFolder + '/index-with-no-data.ejs', null, options, function (err, str) {
      t.assert.ifError(err)
      t.assert.strictEqual(str.length, responseContent.length)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with includes', async t => {
  t.plan(5)
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

  fastify.get('/include-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/include-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  await new Promise((resolve) => {
    ejs.renderFile(templatesFolder + '/index-with-includes.ejs', data, options, function (err, str) {
      t.assert.ifError(err)
      t.assert.strictEqual(str.length, responseContent.length)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with one include missing', async t => {
  t.plan(5)
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

  fastify.get('/include-one-include-missing-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-one-missing', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/include-one-include-missing-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  await new Promise((resolve) => {
    ejs.renderFile(templatesFolder + '/index-with-includes-one-missing.ejs', data, options, function (err, str) {
      t.assert.ok(err)
      t.assert.strictEqual(str, undefined)
      resolve()
    })
  })

  await fastify.close()
})

test('reply.view with ejs engine, templates with folder specified, include files and attributes; page with one attribute missing', async t => {
  t.plan(5)
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

  fastify.get('/include-one-attribute-missing-test', (_req, reply) => {
    reply.type('text/html; charset=utf-8').view('index-with-includes-and-attribute-missing', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/include-one-attribute-missing-test')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)

  await new Promise((resolve) => {
    ejs.renderFile(templatesFolder + '/index-with-includes-and-attribute-missing.ejs', data, options, function (err, str) {
      t.assert.ok(err)
      t.assert.strictEqual(str, undefined)
      resolve()
    })
  })

  await fastify.close()
})

test('fastify.view with ejs engine, missing template file', (t, done) => {
  t.plan(3)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./missing.html', {}, err => {
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(err.message, `ENOENT: no such file or directory, open '${path.join(__dirname, '../missing.html')}'`)
      fastify.close()
      done()
    })
  })
})

test('fastify.view with ejs engine and callback in production mode', (t, done) => {
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
    t.assert.ifError(err)

    fastify.view('templates/index.ejs', data, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), compiled)

      fastify.ready(err => {
        t.assert.ifError(err)

        fastify.view('templates/index.ejs', data, (err, compiled) => {
          t.assert.ifError(err)
          t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), compiled)
          fastify.close()
          done()
        })
      })
    })
  })
})

test('reply.view with ejs engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.ejs', 'utf8') }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view(ejs.compile(fs.readFileSync('./templates/index.ejs', 'utf8')), data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with ejs engine and failed call to render when onError hook defined', async t => {
  t.plan(3)
  const fastify = Fastify()
  const ejs = require('ejs')

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/invalid', (_req, reply) => {
    // Note the mistake in the ternary statement -- the second `?` should be a `:`
    reply.view({
      raw: '<p><%= true ? "text" ? "text2" %></p>'
    })
  })

  fastify.get('/valid', (_req, reply) => {
    reply.view({
      raw: '<%= true ? "text" : "text2" %>'
    })
  })

  // when onError hook is defined, certain errors (such as calls to reply.send inside the `onError` hook) are uncaught
  fastify.addHook('onError', async () => {})

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/invalid')

  t.assert.strictEqual(result.status, 500)

  const result2 = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/valid')

  t.assert.strictEqual(await result2.text(), 'text')
  t.assert.strictEqual(result2.status, 200)

  await fastify.close()
})

test('reply.viewAsync with ejs engine - sync handler', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', async (_req, reply) => {
    return reply.viewAsync('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.viewAsync with ejs engine - async handler', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    }
  })

  fastify.get('/', (_req, reply) => {
    return reply.viewAsync('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.viewAsync should return 500 if layout is missing on render', async t => {
  t.plan(1)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }
  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    return reply.viewAsync('index-for-layout.ejs', data, { layout: 'non-existing-layout.html' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.viewAsync should allow errors to be handled by custom error handler', async t => {
  t.plan(5)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }
  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    root: path.join(__dirname, '../templates')
  })

  fastify.get('/', (_req, reply) => {
    return reply.viewAsync('index-for-layout.ejs', data, { layout: 'non-existing-layout.html' })
  })

  fastify.setErrorHandler((err, _request, reply) => {
    t.assert.ok(err instanceof Error)
    t.assert.strictEqual(reply.getHeader('Content-Type'), undefined)
    return 'something went wrong'
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.headers.get('content-type'), 'text/plain; charset=utf-8')
  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(await result.text(), 'something went wrong')

  await fastify.close()
})

test('reply.viewAsync with ejs engine and custom propertyName', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    propertyName: 'render'
  })

  fastify.get('/', async (_req, reply) => {
    return reply.renderAsync('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.viewAsync with ejs engine and custom asyncPropertyName', async t => {
  t.plan(4)
  const fastify = Fastify()
  const ejs = require('ejs')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      ejs
    },
    asyncPropertyName: 'viewAsPromise'
  })

  fastify.get('/', async (_req, reply) => {
    return reply.viewAsPromise('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.viewAsync with ejs engine and custom asyncPropertyName and custom propertyName', async t => {
  t.plan(8)
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

  fastify.get('/asyncPropertyName', async (_req, reply) => {
    return reply.renderPromise('templates/index.ejs', data)
  })

  fastify.get('/propertyName', (_req, reply) => {
    reply.oldRenderSend('templates/index.ejs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/asyncPropertyName')

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent)

  const result2 = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/propertyName')

  const responseContent2 = await result2.text()

  t.assert.strictEqual(result2.status, 200)
  t.assert.strictEqual(result2.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result2.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(ejs.render(fs.readFileSync('./templates/index.ejs', 'utf8'), data), responseContent2)

  await fastify.close()
})

test('reply.viewAsync with ejs engine and conflicting propertyName/asyncPropertyName', async t => {
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

  await t.assert.rejects(fastify.listen({ port: 0 }))
})
