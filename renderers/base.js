module.exports = ({
  readFile,
  templatesDir,
  getPage,
  lru,
}) => function view (page, data) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }

  data = Object.assign({}, defaultCtx, this.locals, data)
  // append view extension
  page = getPage(page, type)

  const toHtml = lru.get(page)

  if (toHtml && prod) {
    if (!this.getHeader('content-type')) {
      this.header('Content-Type', 'text/html; charset=' + charset)
    }
    this.send(toHtml(data))
    return
  }

  readFile(join(templatesDir, page), 'utf8', readCallback(this, page, data))
}