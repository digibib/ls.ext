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

app.use(express.static(`${__dirname}/../../public`))

if (process.env.NODE_ENV !== 'production') {
  const webpack = require('webpack')
  const webpackConfig = require('../../webpack.config')
  const compiler = webpack(webpackConfig)
  app.use(require('webpack-dev-middleware')(compiler, {
    watchOptions: {
      poll: JSON.parse(process.env.POLL || false)
    },
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  }))
  app.use(require('webpack-hot-middleware')(compiler))
  console.log('HMR activated')
}

require('./routes')(app)

app.listen(port)
console.log(`Server started on port ${port} with environment ${process.env.NODE_ENV || 'development'}`)
