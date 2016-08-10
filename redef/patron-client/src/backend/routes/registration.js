const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const userSettingsMapper = require('../utils/userSettingsMapper')
const querystring = require('querystring')
const registrationForm = Object.assign(require('../../common/forms/registrationPartOne'), require('../../common/forms/registrationPartTwo'))
const extendedValidator = require('../utils/extendedValidator')(registrationForm)

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.post('/api/v1/checkforexistinguser', jsonParser, (request, response) => {
    const params = {
      firstname: request.body.firstName,
      surname: request.body.lastName,
      dateofbirth: dateOfBirth(request.body.year, request.body.month, request.body.day),
      ssn: request.body.ssn
    }

    fetch(`http://koha:8081/api/v1/checkexistinguser?${querystring.stringify(params)}`, {})
    .then(res => {
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
    const errors = extendedValidator(request.body)
    if (Object.keys(errors).length > 0) {
      response.status(400).send({ errors: errors })
      return
    }

    const patron = {
      firstname: request.body.firstName,
      surname: request.body.lastName,
      dateofbirth: dateOfBirth(request.body.year, request.body.month, request.body.day),
      email: request.body.email,
      mobile: request.body.mobile,
      address: request.body.address,
      zipcode: request.body.zipcode,
      city: request.body.city,
      password: request.body.pin,
      branchcode: request.body.library,
      categorycode: 'V', // TODO: Correct loaner category must be set
      userid: `${Math.floor(Math.random() * (99 - 10) + 10)}-${Math.floor(Math.random() * (999 - 100) + 100)}` // TODO: Proper user ID
    }
    fetch('http://koha:8081/api/v1/patrons', {
      method: 'POST',
      body: JSON.stringify(patron)
    }).then(res => {
      if (res.status === 201) {
        return res.json()
      } else if (res.status === 403) {
        response.sendStatus(403)
      } else {
        throw Error('Could not register patron')
      }
    }).then(json => {
      if (!json.borrowernumber) {
        throw Error('Missing borrowernumber in request')
      }
      patron.borrowernumber = json.borrowernumber
      setDefaultSettings(json.borrowernumber)
    }).then(json => {
      response.status(201).send({ username: patron.userid })
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  function setDefaultSettings (borrowerNumber) {
    const settings = JSON.stringify(userSettingsMapper.patronSettingsToKohaSettings({
      alerts: {
        reminderOfDueDate: {
          email: true
        },
        reminderOfPickup: {
          email: true
        }
      },
      receipts: {
        loans: {
          email: true
        },
        returns: {
          email: true
        }
      }
    }))
    fetch(`http://koha:8081/api/v1/messagepreferences/${borrowerNumber}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: settings
    }).then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        throw Error('Could not set default message preferences')
      }
    })
  }

  // Simple generator for a valid YYYY-MM-DD format, return null if not valid
  function dateOfBirth (year, month, day) {
    const validFormat = /^(19|20)\d\d(-)(0[1-9]|1[012])(-)(0[1-9]|[12][0-9]|3[01])$/
    const y = (parseInt(year) + Math.pow(10, 4) + '').slice(1)
    const m = (parseInt(month) + Math.pow(10, 2) + '').slice(1)
    const d = (parseInt(day) + Math.pow(10, 2) + '').slice(1)
    const date = `${y}-${m}-${d}`
    if (!validFormat.test(date)) {
      return null
    } else {
      return date
    }
  }
}
