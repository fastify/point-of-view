'use strict'

process.env.NODE_ENV = 'production'

const express = require('express')
const app = express()

app.set('view engine', 'ejs')

app.get('/', (_req, res) => {
  res.render('../../templates/index.ejs', { text: 'text' })
})

app.listen(3000, err => {
  if (err) throw err
  console.log('server listening on 3000')
})
