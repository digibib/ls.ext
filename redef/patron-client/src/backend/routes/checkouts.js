const isofetch = require('isomorphic-fetch')
const parseString = require('xml2js').parseString
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.put('/api/v1/checkouts', jsonParser, (request, response) => {
    fetch(`http://xkoha:8081/api/v1/checkouts/${request.body.checkoutId}`, {
      method: 'PUT'
    }).then(res => {
      if (res.status === 200 || res.status === 403) {
        return res.json()
      } else {
        throw Error(`Could not renew loan, status ${res.status}`)
      }
    })
    .then(json => {
      if (json && json.date_due) {
        response.status(200).send({ newDueDate: json.date_due, issueId: json.issue_id })
      } else if (json.error) {
        // 403 error needs to be parsed, as it contains reason for renewal not allowed
        const msg = parseCheckoutErrorMsg(json)
        response.status(403).send(msg)
      } else {
        throw Error(`Could not parse renewal answer: ${json}`)
      }
    })
    .catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  function parseCheckoutErrorMsg (json) {
    // get actual error message coming from unauthorised renewal
    let msg = ''
    if (json.error) {
      const m = json.error.match(/\(([^)]+)\)/)
      if (m) {
        msg = m[1]
      }
    }
    return msg
  }

  async function xml2jsPromiseParser (xml) {
    return new Promise((resolve, reject) => {
      parseString(xml, (err, result) => {
        if (err) {
          reject(err)
        } else {
          resolve(result)
        }
      })
    })
  }

  /**
  * Register transaction at Nets. The received transactionId can be used as a key to the transaction
  */
  app.post('/api/v1/checkouts/start-pay-fine', jsonParser, async (request, response) => {
    const merchantId = process.env.NETS_MERCHANT_ID
    const token = process.env.NETS_TOKEN
    const netsUrl = process.env.NETS_URL
    const registerUrl = `${netsUrl}/Netaxept/Register.aspx?merchantId=${merchantId}&token=${token}&orderNumber=${request.body.fineId}&amount=10000&CurrencyCode=NOK&redirectUrl=${request.body.origin}/profile/payment-response/`
    const terminalUrl = `${netsUrl}/Terminal/default.aspx`
    try {
      const res = await isofetch(registerUrl)
      const xmlResponse = await res.text()
      const jsonResponse = await xml2jsPromiseParser(xmlResponse)
      console.log(jsonResponse)
      const transactionId = jsonResponse.RegisterResponse.TransactionId

      const kohaRes = await fetch(`http://xkoha:8081/api/v1/payments/`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: `purre_id=${encodeURIComponent(request.body.fineId)}&nets_id=${encodeURIComponent(transactionId)}`
      })
      const kohaResJson = await kohaRes.json()
      console.log('response from koha', kohaResJson)

      response.send({
        transactionId: transactionId,
        merchantId: merchantId,
        terminalUrl: terminalUrl
      })
    } catch (error) {
      console.log(error)
      response.sendStatus(500)
    }
  })

  /**
  * Process transaction at Nets. Operation = SALE to capture instantly
  * Flow:
  *   Process the transaction at nets
  *   If response from nets is ok, get all loans with fines from koha
  *   Send extend request for all those loans
  *   Keep the ids and results for all extend requests
  *   Capture transaction in Koha
  *   Send response with ids and results to frontend
  */
  app.put('/api/v1/checkouts/process-fine-payment', jsonParser, async (request, response) => {
    const merchantId = process.env.NETS_MERCHANT_ID
    const token = process.env.NETS_TOKEN
    const netsUrl = process.env.NETS_URL
    const processUrl = `${netsUrl}/Netaxept/Process.aspx?merchantId=${merchantId}&token=${token}&transactionId=${request.body.transactionId}&operation=SALE`
    try {
      const res = await isofetch(processUrl)
      const xmlResponse = await res.text()
      const jsonResponse = await xml2jsPromiseParser(xmlResponse)
      console.log(JSON.stringify(jsonResponse))

      if (jsonResponse.Exception) {
        throw Error(`Transaction exception from Nets: ${JSON.stringify(jsonResponse.Exception)}`)
      }
      const authorizationId = jsonResponse.ProcessResponse.AuthorizationId
      const batchNumber = jsonResponse.ProcessResponse.BatchNumber
      const responseCode = jsonResponse.ProcessResponse.ResponseCode
      const transactionId = jsonResponse.ProcessResponse.TransactionId

      // Get all loans from koha
      const loansRes = await fetch(`http://xkoha:8081/api/v1/patrons/${request.session.borrowerNumber}/loansandreservations`)
      const loans = await loansRes.json()
      // Extend all loans with isPurresak
      const successfulExtends = []
      for (const loan of loans.loans) {
        if (loan.isPurresak) {
          const extendRes = await fetch(`http://xkoha:8081/api/v1/checkouts/${loan.id}?override_days=2`, {
            method: 'PUT'
          })
          if (extendRes.status === 200) {
            const extend = await extendRes.json()
            if (extend && extend.date_due) {
              successfulExtends.push(loan.id)
            }
          }
        }
      }

      const kohaRes = await fetch(`http://xkoha:8081/api/v1/payments/`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: `nets_id=${encodeURIComponent(transactionId)}`
      })
      const kohaResJson = await kohaRes.json()
      console.log(kohaResJson)

      response.send({
        transactionId: transactionId,
        responseCode: responseCode,
        authorizationId: authorizationId,
        batchNumber: batchNumber,
        successfulExtends: successfulExtends
      })
    } catch (error) {
      console.log(error)
      response.sendStatus(500)
    }
  })

  app.put('/api/v1/checkouts/email-receipt', jsonParser, async (request, response) => {
    const transactionId = request.body.transactionId
    const email = request.body.email

    try {
      if (!/^[^@ ]+@[^@ ]+$/i.test(email)) {
        const errors = Object.assign({})
        errors['email'] = 'invalidEmail'
        response.status(400).send({ errors: errors })
        return
      }

      const kohaRes = await fetch(`http://xkoha:8081/api/v1/messaging/payment-receipt/${request.session.borrowerNumber}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json, application/xml, text/plain, text/html, *.*',
          'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        },
        body: `nets_id=${encodeURIComponent(transactionId)}&email=${encodeURIComponent(email)}`
      })
      const kohaResJson = await kohaRes.json()
      console.log(kohaResJson)

      response.send({

      })
    } catch (error) {
      console.log(error)
      response.sendStatus(500)
    }
  })
}
