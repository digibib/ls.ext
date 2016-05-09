const fetch = require('isomorphic-fetch')
const parseXML = require('xml2js').parseString
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
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
            })
            .catch(error => {
              console.log(error)
              response.sendStatus(500)
            })
        } else {
          response.sendStatus(403)
        }
      })
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

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
      })
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  function toParamString (object) {
    return Object.keys(object).map(key => `${key}=${encodeURIComponent(object[ key ])}`).join('&')
  }
}
