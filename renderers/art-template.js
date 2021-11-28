module.exports = ({
  getPage,
}) => function viewArtTemplate (page, data) {
  if (!page) {
    this.send(new Error('Missing page'))
    return
  }
  data = Object.assign({}, defaultCtx, this.locals, data)
  // Append view extension.
  page = getPage(page, 'art')

  const defaultSetting = {
    debug: process.env.NODE_ENV !== 'production',
    root: templatesDir
  }

  // merge engine options
  const confs = Object.assign({}, defaultSetting, options)

  function render (filename, data) {
    confs.filename = join(templatesDir, filename)
    const render = engine.compile(confs)
    return render(data)
  }

  try {
    const html = render(page, data)
    if (!this.getHeader('content-type')) {
      this.header('Content-Type', 'text/html; charset=' + charset)
    }
    this.send(html)
  } catch (error) {
    this.send(error)
  }
}
