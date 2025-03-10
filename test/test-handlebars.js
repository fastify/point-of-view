'use strict'

const { test } = require('node:test')
const Fastify = require('fastify')
const fs = require('node:fs')
const { join } = require('node:path')

require('./helper').handleBarsHtmlMinifierTests(true)
require('./helper').handleBarsHtmlMinifierTests(false)

test('fastify.view with handlebars engine', (t, end) => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./templates/index.html', data).then(compiled => {
      t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
      end()
    })
  })
})

test('fastify.view for handlebars without data-parameter but defaultContext', (t, end) => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    defaultContext: data
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./templates/index.html').then(compiled => {
      t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
      end()
    })
  })
})

test('fastify.view for handlebars without data-parameter and without defaultContext', (t, end) => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./templates/index.html').then(compiled => {
      t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(), compiled)
      fastify.close()
      end()
    })
  })
})

test('fastify.view with handlebars engine and defaultContext', (t, end) => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    defaultContext: data
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./templates/index.html', {}).then(compiled => {
      t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
      end()
    })
  })
})

test('reply.view for handlebars engine without data-parameter and defaultContext but with reply.locals', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
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

  const result = await fetch('http://localhost:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(localsData), responseContent)

  await fastify.close()
})

test('reply.view for handlebars engine without defaultContext but with reply.locals and data-parameter', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
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

  const result = await fetch('http://localhost:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), responseContent)

  await fastify.close()
})

test('reply.view for handlebars engine without data-parameter but with reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
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

  const result = await fetch('http://localhost:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(localsData), responseContent)

  await fastify.close()
})

test('reply.view for handlebars engine with data-parameter and reply.locals and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }
  const contextData = { text: 'text from context' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
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

  const result = await fetch('http://localhost:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), responseContent)

  await fastify.close()
})

test('fastify.view with handlebars engine and callback', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./templates/index.html', data, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
      fastify.close()
      end()
    })
  })
})

test('fastify.view with handlebars engine with layout option', (t, end) => {
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
    t.assert.ifError(err)

    fastify.view('./templates/index-for-layout.hbs', data, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), compiled)
      fastify.close()
      end()
    })
  })
})

test('fastify.view with handlebars engine with layout option on render', (t, end) => {
  t.plan(3)

  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'it works!' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./templates/index-for-layout.hbs', data, { layout: './templates/layout.hbs' }, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), compiled)
      fastify.close()
      end()
    })
  })
})

test('fastify.view with handlebars engine with invalid layout option on render should throw', (t, end) => {
  t.plan(5)

  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'it works!' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)
    fastify.view('./templates/index-for-layout.hbs', data, { layout: './templates/invalid-layout.hbs' }, (err) => {
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(err.message, 'unable to access template "./templates/invalid-layout.hbs"')
    })
    // repeated for test coverage of layout access check lru
    fastify.view('./templates/index-for-layout.hbs', data, { layout: './templates/invalid-layout.hbs' }, (err) => {
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(err.message, 'unable to access template "./templates/invalid-layout.hbs"')
      end()
    })
  })
})

test('reply.view with handlebars engine', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
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
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine catches render error', async t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  handlebars.registerHelper('badHelper', () => { throw new Error('kaboom') })

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/error.hbs')
  })

  const result = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.assert.strictEqual(result.json().message, 'kaboom')
  t.assert.strictEqual(result.statusCode, 500)
})

test('reply.view with handlebars engine and layout catches render error', async t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  handlebars.registerHelper('badHelper', () => { throw new Error('kaboom') })

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/error.hbs')
  })

  const result = await fastify.inject({
    method: 'GET',
    url: '/'
  })

  t.assert.strictEqual(result.json().message, 'kaboom')
  t.assert.strictEqual(result.statusCode, 500)
})

test('reply.view with handlebars engine and defaultContext', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
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
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine and includeViewExtension property as true', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    includeViewExtension: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(data), responseContent)

  await fastify.close()
})

test('fastify.view with handlebars engine and callback in production mode', (t, end) => {
  t.plan(6)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    production: true
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./templates/index.html', data, (err, compiled) => {
      t.assert.ifError(err)
      t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)

      fastify.ready(err => {
        t.assert.ifError(err)

        fastify.view('./templates/index.html', data, (err, compiled) => {
          t.assert.ifError(err)
          t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), compiled)
          fastify.close()
          end()
        })
      })
    })
  })
})

test('reply.view with handlebars engine with partials', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      partials: { body: './templates/body.hbs' }
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'))(data), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine with missing partials path', async t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      partials: { body: './non-existent' }
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'application/json; charset=utf-8')

  await fastify.close()
})

test('reply.view with handlebars engine with partials in production mode should use cache', async t => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const POV = require('..')
  fastify.decorate(POV.fastifyViewCache, {
    get: (key) => {
      t.assert.strictEqual(key, 'handlebars|body:./templates/body.hbs|null-Partials')
    },
    set: (key, value) => {
      t.assert.strictEqual(key, 'handlebars|body:./templates/body.hbs|null-Partials')
      t.assert.deepStrictEqual(value, { body: fs.readFileSync('./templates/body.hbs', 'utf8') })
    }
  })

  fastify.register(POV, {
    engine: {
      handlebars
    },
    options: {
      partials: { body: './templates/body.hbs' }
    },
    production: true
  })

  await fastify.ready()
  await fastify.close()
})

test('fastify.view with handlebars engine with missing partials path in production mode does not start', async t => {
  t.plan(1)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      partials: { body: './non-existent' }
    },
    production: true
  })

  await t.assert.rejects(fastify.ready(), undefined, `ENOENT: no such file or directory, open '${join(__dirname, '../non-existent')}'`)
})

test('reply.view with handlebars engine with compile options', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars').create()
  const compileOptions = { preventIndent: true, strict: true }
  const data = { text: 'hello\nworld' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      compileOptions,
      partials: { body: './templates/body.hbs' }
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-with-partials.hbs', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'), compileOptions)(data), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine with useDataVariables', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars').create()
  const compileOptions = { strict: true }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      compileOptions,
      useDataVariables: true,
      partials: { body: './templates/body-data.hbs' }
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.locals = data
    reply.view('./templates/index-with-partials.hbs', null)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'), compileOptions)(null, { data }), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine with useDataVariables and global Ctx', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars').create()
  const compileOptions = { strict: true }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    options: {
      compileOptions,
      useDataVariables: true,
      partials: { body: './templates/body-data.hbs' }
    },
    defaultContext: data
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-with-partials.hbs', null)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index-with-partials.hbs', 'utf8'), compileOptions)(null, { data }), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine with layout option', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-for-layout.hbs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine with layout option on render', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-for-layout.hbs', {}, { layout: './templates/layout.hbs' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(), responseContent)

  await fastify.close()
})

test('reply.view should return 500 if layout is missing on render', async t => {
  t.plan(1)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-for-layout.hbs', {}, { layout: './templates/missing-layout.hbs' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('fastify.view with handlebars engine, missing template file', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.ready(err => {
    t.assert.ifError(err)

    fastify.view('./missing.html', {}, err => {
      t.assert.ok(err instanceof Error)
      t.assert.strictEqual(err.message, `ENOENT: no such file or directory, open '${join(__dirname, '../missing.html')}'`)
      fastify.close()
      end()
    })
  })
})

test('fastify.view with handlebars engine should throw page missing', (t, end) => {
  t.plan(3)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
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

test('reply.view with handlebars engine should return 500 if template fails in production mode', async t => {
  t.plan(2)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const POV = require('..')
  fastify.decorate(POV.fastifyViewCache, {
    get: () => {
      return () => { throw Error('Template Error') }
    },
    set: () => { }
  })

  fastify.register(POV, {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs',
    production: true
  })

  fastify.get('/', (_req, reply) => {
    reply.view('./templates/index-for-layout.hbs')
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 500)
  t.assert.strictEqual(JSON.parse(responseContent).message, 'Template Error')

  await fastify.close()
})

test('reply.view with handlebars engine and raw template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/html').view({ raw: fs.readFileSync('./templates/index.html', 'utf8') }, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine and function template', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8')), data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), responseContent)

  await fastify.close()
})

test('reply.view with handlebars engine and empty template', async t => {
  t.plan(1)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.get('/', (_req, reply) => {
    reply.view(null, data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('fastify.view with handlebars engine and callback in production mode and header', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    production: true,
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/html').view('./templates/index-for-layout.hbs', null)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)
  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.hbs', 'utf8'))(), responseContent)

  await fastify.close()
})

test('fastify.view with handlebars engine and both layout', async t => {
  t.plan(1)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    },
    layout: './templates/layout.hbs'
  })

  fastify.get('/', (_req, reply) => {
    reply.header('Content-Type', 'text/html').view('./templates/index.hbs', data, { layout: './templates/layout.hbs' })
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://127.0.0.1:' + fastify.server.address().port)

  t.assert.strictEqual(result.status, 500)

  await fastify.close()
})

test('reply.viewAsync for handlebars engine without defaultContext but with reply.locals and data-parameter, with async fastify  hooks', async t => {
  t.plan(4)
  const fastify = Fastify()
  const handlebars = require('handlebars')
  const localsData = { text: 'text from locals' }
  const data = { text: 'text' }

  fastify.register(require('../index'), {
    engine: {
      handlebars
    }
  })

  fastify.addHook('preHandler', async function (_request, reply) {
    reply.locals = localsData
  })

  fastify.get('/', async (_req, reply) => {
    return reply.viewAsync('./templates/index.html', data)
  })

  await fastify.listen({ port: 0 })

  const result = await fetch('http://localhost:' + fastify.server.address().port)

  const responseContent = await result.text()

  t.assert.strictEqual(result.status, 200)
  t.assert.strictEqual(result.headers.get('content-length'), '' + responseContent.length)
  t.assert.strictEqual(result.headers.get('content-type'), 'text/html; charset=utf-8')
  t.assert.strictEqual(handlebars.compile(fs.readFileSync('./templates/index.html', 'utf8'))(data), responseContent)

  await fastify.close()
})
