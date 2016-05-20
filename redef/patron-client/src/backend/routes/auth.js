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

          fetch(`http://koha:8081/api/v1/patrons?userid=${request.body.username}`, {
            method: 'GET',
            headers: {
              'Cookie': request.session.kohaSession
            }
          }).then(res => res.json())
            .then(json => {
              request.session.borrowerNumber = json[0].borrowernumber
              request.session.borrowerName = `${json[0].firstname} ${json[0].surname}`
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
}
