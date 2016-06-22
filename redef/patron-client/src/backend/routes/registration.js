const fetch = require('isomorphic-fetch')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const userSettingsMapper = require('../utils/userSettingsMapper')
const sanitizeHtml = require('sanitize-html')
const mysql = require('mysql')

module.exports = (app) => {
  app.post('/api/v1/registration', jsonParser, (request, response) => {
    const patron = {
      firstname: request.body.firstName,
      surname: request.body.lastName,
      dateofbirth: `${request.body.year}-${request.body.month}-${request.body.day}`,
      email: request.body.email,
      mobile: request.body.mobile,
      address: sanitize(request.body.address), // TODO: Finish sanitization
      zipcode: request.body.zipcode,
      city: request.body.city,
      password: request.body.pin,
      branchcode: request.body.library,
      categorycode: 'V',
      userid: `${Math.floor(Math.random() * (99 - 10) + 10)}-${Math.floor(Math.random() * (999 - 100) + 100)}` // TODO: Proper user ID
    }
    fetch('http://koha:8081/api/v1/patrons', {
      method: 'POST',
      headers: {
        'Cookie': app.settings.kohaSession
      },
      body: JSON.stringify(patron)
    }).then(res => {
      if (res.status === 201) {
        response.status(201).send({ username: patron.userid })
        return res.json()
      } else if (res.status === 403) {
        response.sendStatus(403)
      } else {
        throw Error('Could not register patron')
      }
    }).then(json => {
      defaultSettings(json.borrowernumber) // TODO: Make this handling better
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  function defaultSettings (borrowerNumber) {
    fetch(`http://koha:8081/api/v1/messagepreferences/${borrowerNumber}`, {
      method: 'PUT',
      headers: {
        'Cookie': app.settings.kohaSession,
        'Content-type': 'application/json'
      },
      body: JSON.stringify(userSettingsMapper.patronSettingsToKohaSettings({
        alerts: {
          reminderOfDueDate: {
            sms: false,
            email: true
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
      }))
    })
  }

  function sanitize (dirtyInput) {
    return mysql.escape(sanitizeHtml(dirtyInput, {
      allowedTags: []
    }))
  }
}
