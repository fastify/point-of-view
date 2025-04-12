'use strict'

const { test } = require('node:test')
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

test('reply.view with mustache engine', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for mustache without data-parameter but defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for mustache without data-parameter and without defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (_req, reply) => {
    // Reusing the ejs-template is possible because it contains no tags
    reply.view('./templates/index-bare.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index-bare.html', 'utf8')), responseContent)

  await fastify.close()
})

test('reply.view with mustache engine and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.html', {})
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for mustache engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for mustache engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for mustache engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.html')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), localsData), responseContent)

  await fastify.close()
})

test('reply.view for mustache engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
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

  fastify.addHook('preHandler', function (_request, reply, done) {
    reply.locals = localsData
    done()
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with mustache engine with global partials', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    options: {
      partials: {
        body: './templates/body.mustache'
      }
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.mustache', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), responseContent)

  await fastify.close()
})

test('reply.view with mustache engine with global and local partials', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = {}

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    options: {
      partials: {
        partial1: './templates/partial-1.mustache'
      }
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-with-2-partials.mustache', data, { partials: { partial2: './templates/partial-2.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(
    mustache.render(
      fs.readFileSync('./templates/index-with-2-partials.mustache', 'utf8'),
      data,
      {
        partial1: 'Partial 1 - b4d932b9-4baa-4c99-8d14-d45411b9361e\n', // defined globally
        partial2: 'Partial 2 - fdab0fe2-6dab-4429-ae9f-dfcb791d1d3d\n' // defined locally
      }
    ),
    responseContent
  )

  await fastify.close()
})

test('reply.view with mustache engine with partials', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), responseContent)

  await fastify.close()
})

test('reply.view with mustache engine with partials in production mode should use cache', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual('<div>Cached Response</div>', responseContent)

  await fastify.close()
})

test('reply.view with mustache engine with partials in production mode should cache partials correctly', async t => {
  t.plan(8)
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

  fastify.get('/one', (_req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/partial-1.mustache' } })
  })
  fastify.get('/two', (_req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/partial-2.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/one')
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')

  t.assert.match(responseContent, /Partial 1 - b4d932b9-4baa-4c99-8d14-d45411b9361e/g)

  const result2 = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/two')
  const responseContent2 = await result2.text()

  t.assert.strictEqual(result2.status, 200)
  t.assert.strictEqual(result2.headers.get('content-length'), '' + responseContent2.length)
  t.assert.strictEqual(result2.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.match(responseContent2, /Partial 2 - fdab0fe2-6dab-4429-ae9f-dfcb791d1d3d/g)

  await fastify.close()
})

test('reply.view with mustache engine with partials and html-minifier-terser', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(await minifier.minify(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), minifierOpts), responseContent)

  await fastify.close()
})

test('reply.view with mustache engine with partials and paths excluded from html-minifier-terser', async t => {
  t.plan(4)
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

  fastify.get('/test', (_req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port + '/test')
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), responseContent)

  await fastify.close()
})

test('reply.view with mustache engine, template folder specified', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('index.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view with mustache engine, template folder specified with partials', async t => {
  t.plan(4)
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

  fastify.get('/', (_req, reply) => {
    reply.view('index.mustache', data, { partials: { body: 'body.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.mustache', 'utf8'), data, { body: '<p>{{ text }}</p>' }), responseContent)

  await fastify.close()
})

test('reply.view with mustache engine, missing template file', async t => {
  t.plan(3)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('../templates/missing.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')

  await fastify.close()
})

test('reply.view with mustache engine, with partials missing template file', async t => {
  t.plan(3)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/missing.mustache', data, { partials: { body: './templates/body.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')

  await fastify.close()
})

test('reply.view with mustache engine, with partials missing partials file', async t => {
  t.plan(3)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/missing.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')

  await fastify.close()
})

test('reply.view with mustache engine, with partials and multiple missing partials file', async t => {
  t.plan(3)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index.mustache', data, { partials: { body: './templates/missing.mustache', footer: './templates/alsomissing.mustache' } })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')

  await fastify.close()
})

test('fastify.view with mustache engine, should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const mustache = require('mustache')

  fastify.register(require('../index'), {
    engine: {
      mustache
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view(null, {}, err => {
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(err.message, 'Missing page')
      fastify.close()
      end()
    })
  })
})
test('reply.view for mustache and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view({ raw: fs.readFileSync('./templates/index.html', 'utf8') })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), responseContent)

  await fastify.close()
})

test('reply.view for mustache and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const mustache = require('mustache')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      mustache
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/html').view((mustache.render.bind(mustache, fs.readFileSync('./templates/index.html', 'utf8'))))
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html')
  t.assert.strictEqual(mustache.render(fs.readFileSync('./templates/index.html', 'utf8'), data), responseContent)

  await fastify.close()
})
