'use strict'

require('./setup.js')({
  engine: { ejs: require('ejs') },
  route: (req, reply) => { reply.view('index.ejs', { text: 'text' }) },
  options: {
    useHtmlMinifier: require('html-minifier-terser'),
    htmlMinifierOptions: {
      removeComments: true,
      removeCommentsFromCDATA: true,
      collapseWhitespace: true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes: true,
      removeEmptyAttributes: true
    }
  }
})
