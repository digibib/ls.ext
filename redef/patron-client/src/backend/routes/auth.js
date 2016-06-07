const fetch = require('isomorphic-fetch')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
  app.post('/api/v1/login', jsonParser, (request, response) => {
    if (!request.body.username || !request.body.password) {
      return response.sendStatus(403)
    }
    fetch('http://koha:8081/api/v1/auth/session',
      {
        method: 'POST',
        body: JSON.stringify({
          userid: request.body.username,
          password: request.body.password
        })
      })
      .then(res => {
        if (res.status === 201) {
          request.session.kohaSession = res.headers._headers[ 'set-cookie' ][ 0 ]

          fetch(`http://koha:8081/api/v1/patrons?userid=${request.body.username}`, {
            method: 'GET',
            headers: {
              'Cookie': request.session.kohaSession
            }
          }).then(res => res.json())
            .then(json => {
              request.session.borrowerNumber = json[ 0 ].borrowernumber
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

  app.post('/api/v1/logout', (request, response) => {
    request.session.destroy((error) => error ? response.sendStatus(500) : response.sendStatus(200))
  })

  app.get('/api/v1/loginStatus', (request, response) => {
    response.send({
      isLoggedIn: request.session.borrowerNumber !== undefined,
      borrowerNumber: request.session.borrowerNumber
    })
  })
}
