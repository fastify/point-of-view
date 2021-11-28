function viewHandlebars (page, data) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }

  const options = Object.assign({}, opts.options)
  data = Object.assign({}, defaultCtx, this.locals, data)
  // append view extension
  page = getPage(page, 'hbs')
  getTemplate(page, (err, template) => {
    if (err) {
      this.send(err)
      return
    }

    if (prod) {
      try {
        const html = template(data)
        if (!this.getHeader('content-type')) {
          this.header('Content-Type', 'text/html; charset=' + charset)
        }
        this.send(html)
      } catch (e) {
        this.send(e)
      }
    } else {
      getPartials(type, options.partials || {}, (err, partialsObject) => {
        if (err) {
          this.send(err)
          return
        }

        try {
          Object.keys(partialsObject).forEach((name) => {
            engine.registerPartial(name, engine.compile(partialsObject[name]))
          })

          const html = template(data)

          if (!this.getHeader('content-type')) {
            this.header('Content-Type', 'text/html; charset=' + charset)
          }
          this.send(html)
        } catch (e) {
          this.send(e)
        }
      })
    }
  })
}
