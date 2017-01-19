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
      dateofbirth: getDateOfBirth(request.body.year, request.body.month, request.body.day),
      ssn: request.body.ssn
    }

    fetch(`http://xkoha:8081/api/v1/checkexistinguser?${querystring.stringify(params)}`, {})
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          return Promise.reject({ message: 'Could not check for existing patron', status: res.status })
        }
      })
      .then(json => {
        response.json({
          count: json.count,
          localdb: json.localdb,
          centraldb: json.centraldb
        })
      })
      .catch((error) => {
        console.log(`Checkexistinguser error: ${error.message}`)
        console.log(`Status Code: ${error.status}`)
        response.sendStatus(error.status)
      })
  })

  app.post('/api/v1/registration', jsonParser, (request, response) => {
    const errors = extendedValidator(request.body)
    if (Object.keys(errors).length > 0) {
      response.status(400).send({ errors: errors })
      return
    }

    const dateOfBirth = getDateOfBirth(request.body.year, request.body.month, request.body.day)
    const age = getAge(dateOfBirth)
    const categoryCode = age < 15 ? 'REGBARN' : 'REGVOKSEN'
    const sex = sexFromSSN(request.body.ssn)
    const patron = {
      sex: sex,
      firstname: request.body.firstName,
      surname: request.body.lastName,
      dateofbirth: dateOfBirth,
      ssn: request.body.ssn,
      email: request.body.email,
      smsalertnumber: request.body.mobile,
      address: request.body.address,
      zipcode: request.body.zipcode,
      city: request.body.city,
      password: request.body.pin,
      branchcode: request.body.library,
      categorycode: categoryCode,
      userid: `${Math.floor(Math.random() * (99 - 10) + 10)}-${Math.floor(Math.random() * (999 - 100) + 100)}` // TODO: Proper user ID
    }
    registerPatron(patron)
      .then(json => setDefaultMessagingSettings(json))
      .then(json => setDefaultSyncStatusAndAttributes(json))
      .then(json => sendAccountDetailsByMail(json))
      .then(json => {
        response.status(201).send({ username: json.userid, categoryCode: categoryCode })
      })
      .catch(error => {
        console.log(`Registration error: ${error.message}`)
        console.log(`Status Code: ${error.status}`)
        response.sendStatus(error.status)
      })
  })

  function registerPatron (patron) {
    // ssn is needed only for NL sync, so exclude it from POST request
    return fetch('http://xkoha:8081/api/v1/patrons', {
      method: 'POST',
      body: JSON.stringify(patron, (k, v) => k === 'ssn' ? undefined : v)
    }).then(res => {
      if (res.status === 201) {
        return res.json()
      } else {
        return Promise.reject({ message: 'Could not register patron', status: res.status })
      }
    }).then(json => {
      patron.borrowernumber = json.borrowernumber
      return patron
    })
  }

  function setDefaultMessagingSettings (patron) {
    if (!patron.borrowernumber) {
      return Promise.reject({
        message: 'Missing borrowernumber when setting messaging defaults, not able to complete registration',
        status: 400
      })
    }
    const messageSettings = JSON.stringify(userSettingsMapper.patronSettingsToKohaSettings({
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
          email: false
        },
        returns: {
          email: false
        }
      }
    }))
    return fetch(`http://xkoha:8081/api/v1/messagepreferences/${patron.borrowernumber}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: messageSettings
    }).then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        return Promise.reject({ message: 'Could not set default message preferences', status: res.status })
      }
    }).then(json => {
      patron.messageSettings = json
      return patron
    })
  }

  function setDefaultSyncStatusAndAttributes (patron) {
    // TODO: standardize Koha API on PUT params in body?
    return fetch(`http://xkoha:8081/api/v1/patronsyncdefaults/${patron.borrowernumber}?ssn=${patron.ssn}&password=${patron.password}`, {
      method: 'PUT'
    }).then(res => {
      if (res.status === 200) {
        return patron
      } else {
        return Promise.reject({ message: 'Could not set patron sync defaults', status: res.status })
      }
    })
  }

  function sendAccountDetailsByMail (patron) {
    return fetch(`http://xkoha:8081/api/v1/messaging/patrons/${patron.borrowernumber}/accountdetails`, {
      method: 'PUT'
    }).then(res => {
      if (res.status === 200) {
        return patron
      } else {
        return Promise.reject({ message: 'Could not send patron account details by E-mail', status: res.status })
      }
    })
  }

  // Simple generator for a valid YYYY-MM-DD format, return null if not valid
  function getDateOfBirth (year, month, day) {
    const validFormat = /^(19|20)\d\d(-)(0[1-9]|1[012])(-)(0[1-9]|[12][0-9]|3[01])$/
    const y = (String(parseInt(year) + Math.pow(10, 4))).slice(1)
    const m = (String(parseInt(month) + Math.pow(10, 2))).slice(1)
    const d = (String(parseInt(day) + Math.pow(10, 2))).slice(1)
    const date = `${y}-${m}-${d}`
    if (!validFormat.test(date)) {
      return null
    } else {
      return date
    }
  }

  // Return age in years given date of birth
  function getAge (dateOfBirth) {
    const ageMS = Date.now() - Date.parse(dateOfBirth)
    const age = new Date()
    age.setTime(ageMS)
    const ageYear = age.getFullYear() - 1970

    return ageYear
  }

  function sexFromSSN (ssn) {
    if (ssn.length !== 11) {
      return
    }
    if (parseInt(ssn.charAt(8)) % 2 === 0) {
      return 'F'
    } else {
      return 'M'
    }
  }
}
