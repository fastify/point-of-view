module.exports = ({
  getPage,
  getTemplate,
  readFile,
  templatesDir,
  readCallback,
}) => function viewEjs (page, data) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }
  data = Object.assign({}, defaultCtx, this.locals, data)
  // append view extension
  page = getPage(page, type)
  getTemplate(page, (err, template) => {
    if (err) {
      this.send(err)
      return
    }
    const toHtml = lru.get(page)
    if (toHtml && prod && (typeof (toHtml) === 'function')) {
      if (!this.getHeader('content-type')) {
        this.header('Content-Type', 'text/html; charset=' + charset)
      }
      this.send(toHtml(data))
      return
    }
    readFile(join(templatesDir, page), 'utf8', readCallback(this, page, data))
  })
}
