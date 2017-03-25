'use strict'
const express = require('express')
const session = require('express-session')
const uuid = require('node-uuid')
const port = process.env.PORT || 8000
const app = express()

app.use(session({
  genid: req => uuid.v4(),
  secret: 'super top secret patron client if you see this close your eyes',
  resave: true,
  saveUninitialized: false
}))

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack')
  const webpackConfig = require('../../webpack.config')
  const compiler = webpack(webpackConfig)
  app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  }))
  app.use(require('webpack-hot-middleware')(compiler))
  console.log('HMR activated')
}

app.use(express.static(`${__dirname}/../../public`))

require('./routes')(app)

app.listen(port, undefined, () => {})

console.log(`Server started on port ${port} with environment ${process.env.NODE_ENV || 'development'}`)
process.on('SIGUSR2', () => {
  process.env.NODE_ENV = process.env.NODE_ENV === 'development' ? 'production' : 'development'
  console.log(`Received SIGUSR2. Toggling debug level to ${process.env.NODE_ENV}`)
})
