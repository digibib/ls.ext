'use strict'
const express = require('express')
const session = require('express-session')
const uuid = require('node-uuid')
const path = require('path')
const requestProxy = require('express-request-proxy')
const port = process.env.PORT || 8000
const app = express()
const fetch = require('isomorphic-fetch')
const bodyParser = require('body-parser')
const parseXML = require('xml2js').parseString
const jsonParser = bodyParser.json()

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
      poll: JSON.parse(process.env.POLL || false)
    },
    noInfo: true,
    publicPath: webpackConfig.output.publicPath
  }))
  app.use(require('webpack-hot-middleware')(compiler))
  console.log('HMR activated')
}

app.post('/login', jsonParser, (request, response) => {
  if (!request.body.username || !request.body.password) {
    return response.sendStatus(403)
  }
  fetch(`http://services:8081/cgi-bin/koha/svc/authentication?userid=${request.body.username}&password=${request.body.password}`,
    { method: 'GET', body: {} })
    .then(res => {
      if (res.headers && res.headers._headers && res.headers._headers[ 'set-cookie' ] && res.headers._headers[ 'set-cookie' ][ 0 ]) {
        request.session.kohaSession = res.headers._headers[ 'set-cookie' ][ 0 ]
        request.session.username = request.body.username

        fetch('http://services:8081/cgi-bin/koha/svc/members/search', {
          method: 'POST',
          headers: {
            'Cookie': request.session.kohaSession,
            'Accept': 'application/json',
            'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
          },
          body: toParamString({
            'sEcho': 2,
            'searchmember': request.body.username,
            'searchfieldstype': 'standard',
            'searchtype': 'contain',
            'template_path': 'members/tables/members_results.tt'
          })
        }).then(res => res.json())
          .then(json => {
            request.session.borrowerNumber = json[ 'aaData' ][ 0 ][ 'borrowernumber' ]
            response.send({ isLoggedIn: true, borrowerNumber: request.session.borrowerNumber })
          })
      } else {
        response.sendStatus(403)
      }
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
})

app.post('/reserve', jsonParser, (request, response) => {
  fetch('http://services:8081/api/v1/reserves', {
    method: 'POST',
    headers: {
      'Cookie': request.session.kohaSession
    },
    body: JSON.stringify({
      borrowernumber: Number(request.session.borrowerNumber),
      biblionumber: Number(request.body.recordId),
      branchcode: request.body.branchCode
    })
  }).then(res => {
    if (res.status === 201) {
      response.sendStatus(201)
    } else if (res.status === 403) {
      response.sendStatus(403)
    } else {
      throw Error('Could not reserve publication')
    }
  }).catch(error => {
    console.log(error)
    response.sendStatus(500)
  })
})

function toParamString (object) {
  return Object.keys(object).map(key => `${key}=${encodeURIComponent(object[ key ])}`).join('&')
}

app.post('/logout', (request, response) => {
  request.session.destroy((error) => error ? response.sendStatus(500) : response.sendStatus(200))
})

app.get('/loginStatus', (request, response) => {
  response.send({
    isLoggedIn: request.session.kohaSession !== undefined,
    username: request.session.username,
    borrowerNumber: request.session.borrowerNumber
  })
})

app.get('/kohaLoginStatus', (request, response) => {
  fetch('http://services:8081/cgi-bin/koha/svc/authentication',
    {
      method: 'GET',
      body: {},
      headers: {
        'Cookie': request.session.kohaSession
      }
    })
    .then(res => res.text())
    .then(res => {
      parseXML(res, (error, result) => {
        if (error) {
          throw error
        } else if (result.response.status[ 0 ] === 'ok') {
          response.send({ isLoggedIn: true })
        } else {
          response.send({ isLoggedIn: false })
        }
      })
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
})

app.use(express.static(`${__dirname}/../../public`))

app.all('/services/*', requestProxy({
  url: 'http://services:8005/*'
}))

app.get('*', (request, response) => {
  response.sendFile(path.resolve(__dirname, '..', '..', 'public', 'dist', 'index.html'))
})

app.listen(port)
console.log(`Server started on port ${port} with environment ${process.env.NODE_ENV || 'development'}`)
