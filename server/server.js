const express = require('express')
const path = require('path')
const auth = require('./auth')

const app = express()
const port = process.env.PORT || 3000
const publicPath = path.join(__dirname, '..', 'build')
// const publicPath = path.join(__dirname, '..', 'public')

app.all('*', (req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    res.redirect('https://' + req.headers.host + req.url)
  } else {
    next()
  }
})

app.use(auth)
// app.use(express.static(path.join(publicPath, 'node_modules/.bin/react-scripts')))
app.use(express.static(publicPath))
app.get('*', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'))
  // res.sendFile(path.join(publicPath, 'index.js'))
  // res.sendFile(path.join(publicPath, 'node_modules/.bin/react-scripts'))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
})