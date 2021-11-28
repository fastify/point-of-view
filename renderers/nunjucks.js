function viewNunjucks (page, data) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }
  const env = engine.configure(templatesDir, options)
  if (typeof options.onConfigure === 'function') {
    options.onConfigure(env)
  }
  data = Object.assign({}, defaultCtx, this.locals, data)
  // Append view extension.
  page = getPage(page, 'njk')
  env.render(join(templatesDir, page), data, (err, html) => {
    if (err) return this.send(err)
    if (options.useHtmlMinifier && (typeof options.useHtmlMinifier.minify === 'function')) {
      html = options.useHtmlMinifier.minify(html, options.htmlMinifierOptions || {})
    }
    this.header('Content-Type', 'text/html; charset=' + charset)
    this.send(html)
  })
}

module.exports = viewNunjucks
