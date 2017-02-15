'use strict'
const express = require('express')
const path = require('path')
const logger = require('morgan')
const compileSass = require('express-compile-sass')
const app = express()
const port = process.env.BIND_PORT || 8010
const host = process.env.BIND_IP || '0.0.0.0'
require('./workflow_config')(app)
require('./random_test_data')(app)
require('ejs')

if (app.get('env') === 'development') {
  const livereload = require('express-livereload')
  livereload(app, {})

  app.use(require('connect-livereload')({
    port: 35729
  }))
}

app.use(logger('dev'))

app.use(express.static(path.join(__dirname, '/../public'), { maxage: '1h' }))

require('./routes')(app)

app.set('views', './views')
app.set('view-engine', 'ejs')
app.enable('etag')

app.use('/style', compileSass({
  root: path.join(__dirname, '/../client/scss'),
  sourceMap: true, // Includes Base64 encoded source maps in output css
  sourceComments: false, // Includes source comments in output css
  watchFiles: true, // Watches sass files and updates mtime on main files for each change
  logToConsole: true // If true, will log to console.error on errors
}))

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error('Not Found')
  err.status = 404
  next(err)
})

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use((err, req, res, next) => {
    console.error(err.message)
    if (res.headersSent) {
      return next(err)
    }
    res.status(500)
    res.render('error', { error: err })
  })
}

// production error handler
// no stacktraces leaked to user
app.use((err, req, res, next) => {
  console.error(err.message)
  if (res.headersSent) {
    return next(err)
  }
  res.status(500)
  res.render('error', { error: err })
})

app.listen(port, host, () => {})

console.log(`Catalinker server listening at http://${host}:${port} with environment ${process.env.NODE_ENV || 'development'}`)

module.exports = app
