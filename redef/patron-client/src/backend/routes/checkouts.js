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
}
