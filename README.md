# point-of-view

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)
![](https://github.com/fastify/point-of-view/workflows/ci/badge.svg)

Templates rendering plugin support for Fastify.

`point-of-view` decorates the reply interface with the `view` method for manage view engines that can be used to render templates responses.

Currently supports the following templates engines:
- [`ejs`](https://ejs.co/)
- [`nunjucks`](https://mozilla.github.io/nunjucks/)
- [`pug`](https://pugjs.org/api/getting-started.html)
- [`handlebars`](http://handlebarsjs.com/)
- [`marko`](http://markojs.com/)
- [`mustache`](https://mustache.github.io/)
- [`art-template`](https://aui.github.io/art-template/)
- [`twig`](https://twig.symfony.com/)
- [`liquid`](https://github.com/harttle/liquidjs)
- [`doT`](https://github.com/olado/doT)
- [`eta`](https://eta.js.org)

In `production` mode, `point-of-view` will heavily cache the templates file and functions, while in `development` will reload every time the template file and function.

*Note that at least Fastify `v2.0.0` is needed.*

*Note: [`ejs-mate`](https://github.com/JacksonTian/ejs-mate) support [has been dropped](https://github.com/fastify/point-of-view/pull/157).*

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

// With async handler be sure to return the result of reply.view
fastify.get('/', async (req, reply) => {
  const t = await something()
  return reply.view('/templates/index.ejs', { text: 'text' })
})

fastify.listen(3000, err => {
  if (err) throw err
  console.log(`server listening on ${fastify.server.address().port}`)
})
```

Or render a template directly with the `fastify.view()` decorator:
```js
// With a promise
const html = await fastify.view('/templates/index.ejs', { text: 'text' })

// or with a callback
fastify.view('/templates/index.ejs', { text: 'text' }, (err, html) => {
  // ...
})
```

Like having 2 different declarations with different propertynames calling different partials:
```js
fastify.register(require('../index'), {
  engine: { ejs: ejs },
  layout: './templates/layout-mobile.ejs'
  propertyName: 'mobile'
})
fastify.register(require('../index'), {
  engine: { ejs: ejs },
  layout: './templates/layout-desktop.ejs'
  propertyName: 'desktop'
})
```

If you want to set a fixed templates folder, or pass some options to the template engines:
```js
fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  },
  root: path.join(__dirname, 'view'),
  layout: 'template',
  viewExt: 'html', // it will add the extension to all the views
  options: {}
})
```

If you want to set a default context that the variable can be using in each view:
```js
fastify.register(require('point-of-view'), {
  engine: {
    ejs: require('ejs')
  },
  defaultContext: {
    dev: process.env.NODE_ENV === 'development'
  }
})
```
and in the template files like pug can use the variable like:
```html
link(src=dev?"link-to-dev.css":"link-to-pro.css")
```
Note that the data passing to the template will **override** the defaultContext


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
<% include header.ejs %>
```
with a path relative to the current page, or an absolute path.

To use partials in mustache you will need to pass the names and paths in the options parameter:
```js
  options: {
    partials: {
      header: 'header.mustache',
      footer: 'footer.mustache'
    }
  }
```

To use partials in handlebars you will need to pass the names and paths in the options parameter:
```js
  options: {
    partials: {
      header: 'header.hbs',
      footer: 'footer.hbs'
    }
  }
```

To use layouts in handlebars you will need to pass the `layout` parameter:
```js
fastify.register(require('point-of-view'), {
  engine: {
    handlebars: require('handlebars')
  },
  layout: './templates/layout.hbs'
});

fastify.get('/', (req, reply) => {
  reply.view('./templates/index.hbs', { text: 'text' })
})
```

To configure nunjunks environment after initialisation, you can pass callback function to options:
```js
  options: {
    onConfigure: (env) => {
      // do whatever you want on nunjunks env
    }

  }
```

To configure liquid you need to pass the engine instance as engine option:
```js
const { Liquid } = require('liquidjs')
const path = require('path')

const engine = new Liquid({
  root: path.join(__dirname, 'templates'),
  extname: '.liquid'
})

fastify.register(require('point-of-view'), {
  engine: {
    liquid: engine
  }
});

fastify.get('/', (req, reply) => {
  reply.view('./templates/index.liquid', { text: 'text' })
})
```

When using [doT](https://github.com/olado/doT) the plugin compiles all templates when the application starts, this way all `.def` files are loaded and
both `.jst` and `.dot` files are loaded as in-memory functions.
This behaviour is recommended by the doT team [here](https://github.com/olado/doT#security-considerations).
To make it possible it is necessary to provide a `root` or `templates` option with the path to the template directory.
```js
const path = require('path')

fastify.register(require('point-of-view'), {
  engine: {
    dot: require('dot')
  },
  root: 'templates',
  options: {
    destination: 'dot-compiled' // path where compiled .jst files are placed (default = 'out')
  }
});

fastify.get('/', (req, reply) => {
  // this works both for .jst and .dot files
  reply.view('index', { text: 'text' })
})
```

To utilize [`html-minifier`](https://www.npmjs.com/package/html-minifier) in the rendering process, you can add the option `useHtmlMinifier` with a reference to `html-minifier`,
 and the optional `htmlMinifierOptions` option is used to specify the `html-minifier` options:
```js
// get a reference to html-minifier
const minifier = require('html-minifier')
// optionally defined the html-minifier options
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}
// in template engine options configure the use of html-minifier
  options: {
    useHtmlMinifier: minifier,
    htmlMinifierOptions: minifierOpts
  }
```
To utilize [`html-minify-stream`](https://www.npmjs.com/package/html-minify-stream) in the rendering process with template engines that support streams,
 you can add the option `useHtmlMinifyStream` with a reference to `html-minify-stream`, and the optional `htmlMinifierOptions` option is used to specify the options just like `html-minifier`:
```js
// get a reference to html-minify-stream
const htmlMinifyStream = require('html-minify-stream')
// optionally defined the html-minifier options that are used by html-minify-stream
const minifierOpts = {
  removeComments: true,
  removeCommentsFromCDATA: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
  removeAttributeQuotes: true,
  removeEmptyAttributes: true
}
// in template engine options configure the use of html-minify-stream
  options: {
    useHtmlMinifyStream: htmlMinifyStream,
    htmlMinifierOptions: minifierOpts
  }
```

The optional boolean property `production` will override environment variable `NODE_ENV` and force `point-of-view` into `production` or `development` mode:
```js
  options: {
    // force production mode
    production: true
  }
```

If you want to provide data which will be depended on e.g. request and available in all views you have to add property `locals` to `reply` object, like in the example below:
```js
fastify.addHook('preHandler', function (request, reply, done) {
  reply.locals = {
    text: getTextFromRequest(request) // it will be available in all views
  }

  done()
})
```
Properties from `reply.locals` will override those from `defaultContext`, but not from `data` parameter provided to `reply.view(template, data)` function.

To require `point-of-view` as a dependency to a [fastify-plugin](https://github.com/fastify/fastify-plugin), add the name `point-of-view` to the dependencies array in the [plugin's opts](https://github.com/fastify/fastify-plugin#dependencies).

```js
fastify.register(myViewRendererPlugin,   {
  dependencies: ['point-of-view']
})
```

To forcefully clear cache when in production mode, call the `view.clearCache()` function.

```js
fastify.view.clearCache()
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
