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
  fetch(`http://koha:8081/cgi-bin/koha/svc/authentication?userid=${request.body.username}&password=${request.body.password}`,
    { method: 'GET', body: {} })
    .then(res => {
      if (res.headers && res.headers._headers && res.headers._headers[ 'set-cookie' ] && res.headers._headers[ 'set-cookie' ][ 0 ]) {
        request.session.kohaSession = res.headers._headers[ 'set-cookie' ][ 0 ]
        request.session.username = request.body.username

        fetch('http://koha:8081/cgi-bin/koha/svc/members/search', {
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
          }).catch(error => {
            console.log(error)
            response.sendStatus(500)
          })
      } else {
        response.sendStatus(403)
      }
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
})

app.post('/holds', jsonParser, (request, response) => {
  fetch('http://koha:8081/api/v1/holds', {
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

app.get('/api/v1/profile/loans', (request, response) => {
  response.send({
    name: 'Ola finn Oddvar Nordmann',
    pickup: [
      {
        recordId: 'xx',
        title: 'Hard-Boiled Wonderland and the End of the World',
        author: 'Haruki Murakami',
        publicationYear: '1987',
        expiry: '2016-09-21',
        pickupNumber: '40/20220'
      },
      {
        recordId: 'yy',
        title: 'Hard-Boiled Wonderland and the End of the World',
        author: 'Haruki Murakami',
        publicationYear: '1987',
        expiry: '2016-09-21',
        pickupNumber: '40/20220'
      }
    ],
    reservations: [
      {
        recordId: 'xx',
        title: 'Hard-Boiled Wonderland and the End of the World',
        author: 'Lars- Saabye Christensen',
        orderedDate: '2016-12-03',
        waitingPeriod: 'xxx',
        branchCode: 'dfb'
      },
      {
        recordId: 'yy',
        title: 'Hard-Boiled Wonderland and the End of the World',
        author: 'Lars- Saabye Christensen',
        orderedDate: '2016-12-03',
        waitingPeriod: 'xxx',
        branchCode: 'dfb'
      }
    ],
    loans: [
      {
        recordId: 'xx',
        title: 'Hard-Boiled Wonderland and the End of the World',
        author: 'Lars- Saabye Christensen',
        publicationYear: '1987',
        dueDate: '2016-12-05'
      },
      {
        recordId: 'yy',
        title: 'Hard-Boiled Wonderland and the End of the World',
        author: 'Lars- Saabye Christensen',
        publicationYear: '1987',
        dueDate: '2016-12-05'
      }
    ]
  })
})

app.post('/api/v1/profile/info', jsonParser, (request, response) => {
  request.session.profileInfo = request.body
  response.sendStatus(200)
})

app.get('/api/v1/profile/info', (request, response) => {
  const template = {
    borrowerNumber: 'n1484848',
    name: 'Ola finn Oddvar Nordmann',
    address: 'Midtisvingen 78',
    zipcode: '2478',
    city: 'Oslo',
    country: 'Norway',
    mobile: '987 65 432',
    telephone: '53 01 23 45',
    email: 'ola.finn.oddvar@online.no',
    birthdate: '1977-12-13',
    loanerCardIssued: '2012-01-30',
    loanerCategory: 'adult',
    lastUpdated: '2016-02-01'
  }
  if (request.session.profileInfo) {
    response.send(Object.assign(template, request.session.profileInfo))
  } else {
    response.send(template)
  }
})

app.post('/api/v1/profile/settings', jsonParser, (request, response) => {
  request.session.profileSettings = request.body
  response.sendStatus(200)
})

app.get('/api/v1/profile/settings', (request, response) => {
  if (request.session.profileSettings) {
    response.send(request.session.profileSettings)
  } else {
    response.send({
      alerts: {
        reminderOfDueDate: {
          sms: true,
          email: false
        },
        reminderOfPickup: {
          sms: false,
          email: true
        }
      },
      reciepts: {
        loans: {
          email: true
        },
        returns: {
          email: true
        }
      }
    })
  }
})

app.get('/kohaLoginStatus', (request, response) => {
  fetch('http://koha:8081/cgi-bin/koha/svc/authentication',
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
