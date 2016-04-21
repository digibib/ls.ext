'use strict'
const express = require('express')
const path = require('path')
const requestProxy = require('express-request-proxy')
const port = process.env.PORT || 8000
const app = express()

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

app.use(express.static(`${__dirname}/../../public`))

app.all('/services/*', requestProxy({
  url: 'http://services:8005/*'
}))

app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, '..', '..', 'public', 'dist', 'index.html'))
})

app.listen(port)
console.log(`Server started on port ${port} with environment ${process.env.NODE_ENV || 'development'}`)
