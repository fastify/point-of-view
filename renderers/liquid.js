function viewLiquid (page, data, opts) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }

  data = Object.assign({}, defaultCtx, this.locals, data)
  // Append view extension.
  page = getPage(page, 'liquid')

  engine.renderFile(join(templatesDir, page), data, opts)
    .then((html) => {
      if (options.useHtmlMinifier && (typeof options.useHtmlMinifier.minify === 'function')) {
        html = options.useHtmlMinifier.minify(html, options.htmlMinifierOptions || {})
      }
      if (!this.getHeader('content-type')) {
        this.header('Content-Type', 'text/html; charset=' + charset)
      }
      this.send(html)
    })
    .catch((err) => {
      this.send(err)
    })
}

module.exports = viewLiquid
