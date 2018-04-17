const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const userSettingsMapper = require('../utils/userSettingsMapper')
const bcrypt = require('bcrypt-nodejs')
const userInfoForm = require('../../common/forms/userInfoForm')
const contactDetailsForm = require('../../common/forms/contactDetailsForm')
const extendedValidatorUserInfo = require('../utils/extendedValidator')(userInfoForm)
const extendedValidatorContactDetails = require('../utils/extendedValidator')(contactDetailsForm)
const querystring = require('querystring')

module.exports = (app) => {
  const fetch = require('../fetch')(app)

  app.post('/api/v1/profile/settings/history', jsonParser, async (request, response) => {
    try {
      await updatePatronPrivacy(request.session.borrowerNumber, request.body.privacy)
      await updateHistoryConsent(request.session.borrowerNumber, request.body.privacy === 0, request.body.hist_cons)
      response.status(200).send({success: true})
    } catch (error) {
      console.log(error)
      response.sendStatus(500)
    }
  })

  app.post('/api/v1/profile/settings/historyconsent', jsonParser, async (request, response) => {
    const consent = request.body.consent
    const privacy = consent ? 0 : 2
    const borrowernumber = request.session.borrowerNumber
    try {
      await updateHistoryConsent(borrowernumber, consent, request.body.previous)
      await updatePatronPrivacy(borrowernumber, privacy)
      response.status(200).send({success: true})
    } catch (error) {
      console.log(error)
      response.sendStatus(500)
    }
  })

  app.post('/api/v1/profile/history', jsonParser, (request, response) => {
    const params = {
      offset: request.body.offset || 0,
      limit: request.body.limit || 20
    }
    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}/history?${querystring.stringify(params)}`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          throw Error(res.statusText)
        }
      }).then(json => response.status(200).send(json))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.delete('/api/v1/profile/history', jsonParser, (request, response) => {
    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}/history`, { method: 'DELETE' })
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          throw Error(res.statusText)
        }
      }).then(json => response.status(200).send(json))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.get('/api/v1/profile/info', async (request, response) => {
    try {
      const profileResp = await fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}`)
      const attributesResp = await fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}/attributes`)
      if (profileResp.status !== 200 || attributesResp.status != 200) {
        throw Error("failed to fetch patron profile")
      }
      const profile = await profileResp.json()
      const attributes = await attributesResp.json()
      response.status(200).send({info: parsePatron(profile), attributes: parseAttributes(attributes)})
    } catch (err) {
      console.log(err)
      response.sendStatus(500)
    }
  })

  app.post('/api/v1/profile/info', jsonParser, (request, response) => {
    const errors = extendedValidatorUserInfo(request.body)
    if (Object.keys(errors).length > 0) {
      response.status(400).send({ errors: errors })
      return
    }

    const patron = {
      address: request.body.address,
      zipcode: request.body.zipcode,
      city: request.body.city,
      country: request.body.country,
      smsalertnumber: request.body.mobile,
      phone: request.body.telephone,
      email: request.body.email
    }

    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}`, {
      method: 'PUT',
      body: JSON.stringify(patron)
    }).then(res => {
      if (res.status === 200 || res.status === 204) {
        res.json().then(json => response.status(res.status).send(parsePatron(json)))
      } else {
        response.status(res.status).send(res.body)
      }
    })
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.post('/api/v1/profile/contactdetails', jsonParser, (request, response) => {
    const errors = extendedValidatorContactDetails(request.body)
    if (Object.keys(errors).length > 0) {
      response.status(400).send({ errors: errors })
      return
    }

    const contactDetails = {
      smsalertnumber: request.body.mobile,
      email: request.body.email
    }

    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}`, {
      method: 'PUT',
      body: JSON.stringify(contactDetails)
    }).then(res => {
      if (res.status === 200 || res.status === 204) {
        res.json().then(json => response.status(res.status).send(parsePatron(json)))
      } else {
        response.status(res.status).send(res.body)
      }
    })
    .catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  app.get('/api/v1/profile/loans', (request, response) => {
    fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}/loansandreservations`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          throw Error(res.statusText)
        }
      }).then(json => {
        response.send(json)
      })
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.post('/api/v1/profile/settings', jsonParser, (request, response) => {
    fetch(`http://xkoha:8081/api/v1/messagepreferences/${request.session.borrowerNumber}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(userSettingsMapper.patronSettingsToKohaSettings(request.body))
    }).then(res => {
      if (res.status === 200) {
        return res.json()
      } else {
        response.status(res.status).send(res.body)
      }
    }).then(kohaSettings => response.status(200).send(userSettingsMapper.kohaSettingsToPatronSettings(kohaSettings)))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.put('/api/v1/profile/settings/password', jsonParser, (request, response) => {
    if (bcrypt.compareSync(request.body.currentPassword, request.session.passwordHash)) {
      fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}`, {
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify({ password: request.body.newPassword })
      }).then(res => {
        if (res.status === 200) {
          request.session.passwordHash = bcrypt.hashSync(request.body.newPassword)
          response.sendStatus(200)
        } else {
          response.status(res.status).send(res.body)
        }
      }).catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
    } else {
      response.status(403).send('Old password is not correct')
    }
  })

  app.post('api/v1/profile/managehistory', jsonParser, async (request, response) => {
    try {
      await updatePatronPrivacy(request.session.borrowerNumber, request.body.privacy)
      await updateHistoryConsent(request.session.borrowerNumber, request.body.privacy === 0, request.body.hist_cons)
      response.status(200).send({success: true})
    } catch (error) {
      console.log(error)
      response.sendStatus(500)
    }
  })

  app.get('/api/v1/profile/settings', (request, response) => {
    return fetch(`http://xkoha:8081/api/v1/messagepreferences/${request.session.borrowerNumber}`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          throw Error(res.statusText)
        }
      }).then(kohaSettings => userSettingsMapper.kohaSettingsToPatronSettings(kohaSettings))
      .then(patronSettings => response.send(patronSettings))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  async function updatePatronPrivacy (borrowernumber, privacy) {
    const res = await fetch(`http://xkoha:8081/api/v1/patrons/${borrowernumber}`, {
      method: 'PUT',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ privacy: privacy })})
    if (res.status != 200 && res.status != 204) {
      throw Error("failed to update patron privacy setting")
    }
  }

  async function updateHistoryConsent (borrowernumber, new_consent, previous_consent) {
    let attribute = new_consent ? 'yes' : 'no'
    if (previous_consent && previous_consent.startsWith(new_consent)) {
      // Allready sat consent, don't need to do it again
      return
    }
    attribute += '_'
    attribute += Date.now()

    const params = {
      code: 'hist_cons',
      attribute: attribute
    }
    let method = 'POST'
    let url = `http://xkoha:8081/api/v1/patrons/${borrowernumber}/attributes`
    if (previous_consent) {
      method = 'PUT'
      url = `http://xkoha:8081/api/v1/patrons/${borrowernumber}/attributes/hist_cons`
    }
    const consentRes = await fetch(url, {method: method, body: JSON.stringify(params)})
    if (consentRes.status > 204) { // 200 = OK updated, 201 OK created, 204 = OK no change to persist
      throw Error("failed to update patron history consent attribute")
    }
  }

  function parseAttributes (attributes) {
    let filteredAttributes = {}
    attributes.forEach(a => {
      if (a.code === 'fnr') {
        return
      }
      filteredAttributes[a.code] = a.attribute
    })
    return filteredAttributes
  }

  function parsePatron (patron) {
    return {
      privacy: patron.privacy,
      borrowerNumber: patron.borrowernumber || '',
      cardNumber: patron.cardnumber || '',
      homeBranch: patron.branchcode || '',
      name: `${patron.firstname} ${patron.surname}`,
      address: patron.address || '',
      zipcode: patron.zipcode || '',
      city: patron.city || '',
      country: patron.country || '',
      mobile: patron.smsalertnumber || '', // is this the only sms number?
      telephone: patron.phone || '',
      email: patron.email || '',
      birthdate: patron.dateofbirth || '',
      loanerCardIssued: patron.dateenrolled || '',
      /* lastUpdated: '2016-02-01', TODO does not exist in koha yet */
      loanerCategory: patron.categorycode || ''
    }
  }
}
