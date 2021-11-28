function viewDot (renderModule) {
  return function _viewDot (page, data, opts) {
    if (!page) {
      this.send(new Error('Missing page'))
      return
    }
    data = Object.assign({}, defaultCtx, this.locals, data)
    let html = renderModule[page](data)
    if (options.useHtmlMinifier && (typeof options.useHtmlMinifier.minify === 'function')) {
      html = options.useHtmlMinifier.minify(html, options.htmlMinifierOptions || {})
    }
    if (!this.getHeader('content-type')) {
      this.header('Content-Type', 'text/html; charset=' + charset)
    }
    this.send(html)
  }
}

module.exports = viewDot
