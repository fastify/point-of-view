function viewMustache (page, data, opts) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }

  const options = Object.assign({}, opts)
  data = Object.assign({}, defaultCtx, this.locals, data)
  // append view extension
  page = getPage(page, 'mustache')
  getTemplate(page, (err, templateString) => {
    if (err) {
      this.send(err)
      return
    }
    getPartials(page, options.partials || {}, (err, partialsObject) => {
      if (err) {
        this.send(err)
        return
      }
      const html = engine.render(templateString, data, partialsObject)

      if (!this.getHeader('content-type')) {
        this.header('Content-Type', 'text/html; charset=' + charset)
      }
      this.send(html)
    })
  })
}

module.exports = viewMustache
