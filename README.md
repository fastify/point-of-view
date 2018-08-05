# point-of-view

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
 [![Build Status](https://travis-ci.org/fastify/point-of-view.svg?branch=master)](https://travis-ci.org/fastify/point-of-view)

Templates rendering plugin support for Fastify.

`point-of-view` decorates the reply interface with the `view` method for manage view engines that can be used to render templates responses.

Currently supports the following templates engines:
- [`ejs`](http://www.embeddedjs.com/)
- [`ejs-mate`](https://github.com/JacksonTian/ejs-mate)
- [`nunjucks`](https://mozilla.github.io/nunjucks/)
- [`pug`](https://pugjs.org/api/getting-started.html)
- [`handlebars`](http://handlebarsjs.com/)
- [`marko`](http://markojs.com/)
- [`mustache`](https://mustache.github.io/)

In `production` mode, `point-of-view` will heavily cache the templates file and functions, while in `development` will reload every time the template file and function.

*Note that at least Fastify `v0.13.1` is needed.*

#### Benchmarks
The benchmark were run with the files in the `benchmark` folder with the `ejs` engine.  
The data has been taken with: `autocannon -c 100 -d 5 -p 10 localhost:3000`
- Express: 8.8k req/sec
- **Fastify**: 15.6k req/sec

## Install

```
npm install point-of-view --save
```

<a name="usage"></a>
## Usage
```js
const fastify = require('fastify')()

fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  }
})

fastify.get('/', (req, reply) => {
  reply.view('/templates/index.ejs', { text: 'text' })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
```

If you want to set a fixed templates folder, or pass some options to the template engines:
```js
fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  },
  templates: 'templates',
  options: {}
})
```

If you want to omit view extension, you can add `includeViewExtension` property as following:
```javascript
fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  },
  includeViewExtension: true
});

fastify.get('/', (req, reply) => {
  reply.view('/templates/index', { text: 'text' })
})
```

Note that to use include files with ejs you also need:
```js
// get a reference to resolve
const resolve = require('path').resolve
// other code ...
// in template engine options configure how to resolve templates folder
  options: {
    filename: resolve('templates')
  }
```
and in ejs template files (for example templates/index.ejs) use something like:
```html
<% include templates/header.ejs %>
```

To use partials in mustache you will need to pass the names and paths in the options parameter:
```js
  options: {
    partials: {
      header: 'header.mustache',
      footer: 'footer.mustache'
    }
  }
```

<a name="note"></a>
## Note

By default views are served with the mime type 'text/html; charset=utf-8',
but you can specify a different value using the type function of reply, or by specifying the desired charset in the property 'charset' in the opts object given to the plugin.


## Acknowledgements

This project is kindly sponsored by:
- [nearForm](http://nearform.com)
- [LetzDoIt](http://www.letzdoitapp.com/)

## License

Licensed under [MIT](./LICENSE).
