const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const userSettingsMapper = require('../utils/userSettingsMapper')
const sanitizeHtml = require('sanitize-html')
const querystring = require('querystring');
// const mysql = require('mysql')

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.post('/api/v1/checkforexistinguser', jsonParser, (request, response) => {
    const params = {
      firstname: request.body.firstName,
      surname: request.body.lastName,
      dateofbirth: dateOfBirth(request.body.year, request.body.month, request.body.day),
      ssn: request.body.ssn
    }

    fetch(`http://koha:8081/api/v1/checkexistinguser?${querystring.stringify(params)}`, {
      method: 'GET',
      headers: {
        'Cookie': app.settings.kohaSession,
      }
    }).then(res => {
      if (res.status === 200) {
        return res.json()
      } else if (res.status === 403) {
        response.sendStatus(403)
      } else {
        throw Error('Could not check for existing patron')
      }
    }).then(json => {
      response.json({
        count: json.count,
        localdb: json.localdb,
        centraldb: json.centraldb
      })
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  app.post('/api/v1/registration', jsonParser, (request, response) => {
    const patron = {
      firstname: request.body.firstName,
      surname: request.body.lastName,
      dateofbirth: dateOfBirth(request.body.year, request.body.month, request.body.day),
      email: request.body.email,
      mobile: request.body.mobile,
      address: sanitize(request.body.address), // TODO: Finish sanitization
      zipcode: request.body.zipcode,
      city: request.body.city,
      password: request.body.pin,
      branchcode: request.body.library,
      categorycode: 'V', // TODO: defaulting to Voksen patron category
      userid: `${Math.floor(Math.random() * (99 - 10) + 10)}-${Math.floor(Math.random() * (999 - 100) + 100)}` // TODO: Proper user ID
    }
    fetch('http://koha:8081/api/v1/patrons', {
      method: 'POST',
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

  // TODO: check this, probably not working
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

  // Simple generator for a valid YYYY-MM-DD format, return null if not valid
  function dateOfBirth (year, month, day) {
    const validFormat=/^(19|20)\d\d(-)(0[1-9]|1[012])(-)(0[1-9]|[12][0-9]|3[01])$/
    const y = (parseInt(year)+Math.pow(10,4)+"").slice(1)
    const m = (parseInt(month)+Math.pow(10,2)+"").slice(1)
    const d = (parseInt(day)+Math.pow(10,2)+"").slice(1)
    const date = `${y}-${m}-${d}`
    if (!validFormat.test(date)) {
      return null
    } else {
      return date
    }
  }

  function sanitize (dirtyInput) {
    // TODO: Fix. mysql.escape returns quoted output
    // return mysql.escape(sanitizeHtml(dirtyInput, {
    //   allowedTags: []
    // }))
    return sanitizeHtml(dirtyInput, {
      allowedTags: []
    })
  }
}
