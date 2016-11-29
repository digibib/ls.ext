const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const bcrypt = require('bcrypt-nodejs')

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.post('/api/v1/login', jsonParser, (request, response) => {
    if (!request.body.username || !request.body.password) {
      return response.sendStatus(403)
    }
    let borrowerNumber
    loginHandler(request.body.username)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          return Promise.reject({ message: 'User not found', status: 403 })
        }
      })
      .then(json => {
        // only unique user should be able to create user session
        if (json.length !== 1) {
          return Promise.reject({ message: 'User not unique', status: 403 })
        } else {
          borrowerNumber = json[ 0 ].borrowernumber
          return fetch('http://xkoha:8081/api/v1/auth/session', {
            method: 'POST',
            headers: {
              'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
              'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            },
            body: `userid=${encodeURIComponent(json[ 0 ].userid)}&password=${encodeURIComponent(request.body.password)}`
          })
        }
      })
      .then(res => {
        if (res.status === 201) {
          request.session.borrowerNumber = borrowerNumber
          request.session.kohaSession = res.headers._headers[ 'set-cookie' ][ 0 ]
          request.session.passwordHash = bcrypt.hashSync(request.body.password)
          return res.json()
        } else {
          return Promise.reject({ message: 'Could not create session', status: 403 })
        }
      })
      .then(json => {
        request.session.borrowerName = `${json.firstname} ${json.surname}`
        response.send({ isLoggedIn: true, borrowerNumber: request.session.borrowerNumber })
      })
      .catch(error => {
        console.log(error.message)
        response.sendStatus(error.status)
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

  function loginHandler (username) {
    if (/^[^@ ]+@[^@ ]+$/i.test(username)) {
      return fetch(`http://xkoha:8081/api/v1/patrons?email=${username}`)
    } else {
      return fetch(`http://xkoha:8081/api/v1/patrons?userid=${username}`)
    }
  }
}
