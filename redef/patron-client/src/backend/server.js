'use strict'
const express = require('express')
const path = require('path')
const requestProxy = require('express-request-proxy')
const port = process.env.PORT || 8000
const app = express()

const webpack = require('webpack')
let webpackConfig
if (process.env.NODE_ENV === 'docker') {
  webpackConfig = require('../../webpack.config.docker')
} else if (process.env.NODE_ENV === 'production') {
  webpackConfig = require('../../webpack.config.production')
} else {
  webpackConfig = require('../../webpack.config')
}
const compiler = webpack(webpackConfig)

app.use(require('webpack-dev-middleware')(compiler, {
  watchOptions: {
    poll: true
  },
  noInfo: true,
  publicPath: webpackConfig.output.publicPath
}))
app.use(require('webpack-hot-middleware')(compiler))

app.use(express.static(`${__dirname}/../../public`))

app.all('/services/*', requestProxy({
  url: 'http://services:8005/*'
}))

app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, '..', '..', 'public', 'dist', 'index.html'))
})

app.listen(port)
console.log(`Server started on port ${port}`)
