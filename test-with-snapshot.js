'use strict'

const t = require('tap')
const test = t.test
const request = require('request')
const Fastify = require('fastify')

test('reply.view with ejs engine, template folder specified, include files (ejs and html) used in template, includeViewExtension property as true; requires TAP snapshots enabled', t => {
  t.plan(8)
  const fastify = Fastify()
  const ejs = require('ejs')
  const resolve = require('path').resolve
  const templatesFolder = 'templates'
  const options = {
    filename: resolve(templatesFolder),  // needed for include files to be resolved in include directive ...
    views: [__dirname]  // must be put to make tests (with include files) working ...
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
    reply.type('text/html; charset=utf-8').view('index-with-includes', data)
  })

  fastify.listen(0, err => {
    t.error(err)

    request({
      method: 'GET',
      uri: 'http://localhost:' + fastify.server.address().port
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
      t.matchSnapshot(content, 'output')

      fastify.close()
    })
  })
})
