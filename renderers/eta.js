function viewEta (page, data) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }

  lru.define = lru.set
  engine.configure({
    templates: options.templates ? options.templates : lru
  })

  const config = Object.assign({
    cache: prod,
    views: templatesDir
  }, options)

  data = Object.assign({}, defaultCtx, this.locals, data)
  // Append view extension (Eta will append '.eta' by default,
  // but this also allows custom extensions)
  page = getPage(page, 'eta')
  engine.renderFile(page, data, config, (err, html) => {
    if (err) return this.send(err)
    if (
      config.useHtmlMinifier &&
      typeof config.useHtmlMinifier.minify === 'function'
    ) {
      html = config.useHtmlMinifier.minify(
        html,
        config.htmlMinifierOptions || {}
      )
    }
    this.header('Content-Type', 'text/html; charset=' + charset)
    this.send(html)
  })
}

if (prod && type === 'handlebars' && options.partials) {
  getPartials(type, options.partials, (err, partialsObject) => {
    if (err) {
      next(err)
      return
    }
    Object.keys(partialsObject).forEach((name) => {
      engine.registerPartial(name, engine.compile(partialsObject[name]))
    })
    next()
  })
} else {
  next()
}

module.exports = viewEta
