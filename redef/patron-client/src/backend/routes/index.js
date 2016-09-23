const requestProxy = require('express-request-proxy')
import { renderToString } from 'react-dom/server'
import { match } from 'react-router'
import { routes } from '../../frontend/routes/index'
import React from 'react'
import no from 'react-intl/locale-data/no'
import { addLocaleData } from 'react-intl'
import App from '../components/App'
import { Provider } from 'react-redux'
import store from '../../frontend/store/index'
import cookieParser from 'cookie-parser'

addLocaleData(no)

module.exports = (app) => {
  require('./auth')(app)
  require('./checkouts')(app)
  require('./holds')(app)
  require('./profile')(app)
  require('./libraries')(app)
  require('./registration')(app)
  require('./search')(app)
  require('./validation')(app)
  require('./terms')(app)

  app.all('/services/*', requestProxy({
    url: 'http://services:8005/*',
    timeout: 30 * 1000 // 30 seconds
  }))

  app.use(cookieParser())

  app.use((req, res) => {
    match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
      if (error) {
        res.status(500).send(error.message)
      } else if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search)
      } else if (renderProps) {
        const locale = req.cookies && req.cookies.locale ? req.cookies.locale : 'no'
        const connectedApp = (
          <Provider store={store}>
            <App renderProps={renderProps} locale={locale} />
          </Provider>
        )
        const componentHTML = renderToString(connectedApp)
        const bundle = process.env.NODE_ENV === 'production' ? 'bundle.min.js' : 'bundle.js'
        const HTML =
          `<!DOCTYPE html>
            <html lang="no">
            <head>
                <meta charset="utf-8" />
                <meta http-equiv="x-ua-compatible" content="ie=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
                <title>Deichmanske bibliotek - søk</title>
            </head>
            <body>
            <div id="app">${componentHTML}</div>
            <script type="text/javascript" src="/dist/${bundle}"></script></body>
            </html>`
        res.end(HTML)
      } else {
        res.status(404).send('Not found')
      }
    })
  })
}
