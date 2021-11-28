const renderers = {
  ejs: withLayout(require('./ejs')),
  nunjucks: require('./nunjucks'),
  marko: require('./marko'),
  handlebars: withLayout(require('./handlebars')),
  mustache: require('./mustache'),
  'art-template': require('./art-template'),
  twig: require('./twig'),
  liquid: require('./liquid'),
  dot: dotRender => withLayout(dotRender(require('./dot'))),
  eta: withLayout(require('./eta')),
}

function getRenderer (type, helpers) {
  return renderers[type] ? renderers[type](helpers) : base(helpers)
}

module.exports = {
  getRenderer,
} 

function withLayout (render) {
  if (layoutFileName) {
    return function (page, data, opts) {
      const that = this

      data = Object.assign({}, defaultCtx, this.locals, data)

      render.call({
        getHeader: () => { },
        header: () => { },
        send: (result) => {
          if (result instanceof Error) {
            throw result
          }

          data = Object.assign((data || {}), { body: result })

          render.call(that, layoutFileName, data, opts)
        }
      }, page, data, opts)
    }
  }

  return render
}
