function viewMarko (page, data, opts) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }

  data = Object.assign({}, defaultCtx, this.locals, data)
  // append view extension
  page = getPage(page, type)

  // Support compile template from memory
  // opts.templateSrc : string - pre-loaded template source
  // even to load from memory, a page parameter still should be provided and the parent path should exist for the loader to search components along the path.

  const template = opts && opts.templateSrc ? engine.load(join(templatesDir, page), opts.templateSrc) : engine.load(join(templatesDir, page))

  if (opts && opts.stream) {
    if (typeof options.useHtmlMinifyStream === 'function') {
      this.send(template.stream(data).pipe(options.useHtmlMinifyStream(options.htmlMinifierOptions || {})))
    } else {
      this.send(template.stream(data))
    }
  } else {
    template.renderToString(data, send(this))
  }

  function send (that) {
    return function _send (err, html) {
      if (err) return that.send(err)
      if (options.useHtmlMinifier && (typeof options.useHtmlMinifier.minify === 'function')) {
        html = options.useHtmlMinifier.minify(html, options.htmlMinifierOptions || {})
      }
      that.header('Content-Type', 'text/html; charset=' + charset)
      that.send(html)
    }
  }
}
