'use strict'
const express = require('express')
const session = require('express-session')
const uuid = require('node-uuid')
const port = process.env.PORT || 8000
const app = express()
const fetch = require('isomorphic-fetch')

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
    watchOptions: {
      poll: JSON.parse(process.env.POLL || false),
      ignored: /node_modules/
    },
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  }))
  app.use(require('webpack-hot-middleware')(compiler))
  console.log('HMR activated')
}

app.use(express.static(`${__dirname}/../../public`))

require('./routes')(app)

app.listen(port, undefined, () => {
  fetch('http://koha:8081/cgi-bin/koha/svc/authentication?userid=api&password=secret',
    { method: 'GET', body: {} })
    .then(res => {
      if (res.headers && res.headers._headers && res.headers._headers[ 'set-cookie' ] && res.headers._headers[ 'set-cookie' ][ 0 ]) {
        app.set('kohaSession', res.headers._headers[ 'set-cookie' ][ 0 ])
      }
    }).catch(error => console.log(error))
})

console.log(`Server started on port ${port} with environment ${process.env.NODE_ENV || 'development'}`)
