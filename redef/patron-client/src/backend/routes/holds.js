const fetch = require('isomorphic-fetch')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
  app.post('/api/v1/holds', jsonParser, (request, response) => {
    fetch('http://koha:8081/api/v1/holds', {
      method: 'POST',
      headers: {
        'Cookie': request.session.kohaSession
      },
      body: JSON.stringify({
        borrowernumber: Number(request.session.borrowerNumber),
        biblionumber: Number(request.body.recordId),
        branchcode: request.body.branchCode
      })
    }).then(res => {
      if (res.status === 201) {
        response.sendStatus(201)
      } else if (res.status === 403) {
        response.sendStatus(403)
      } else {
        throw Error('Could not reserve publication')
      }
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })

  app.put('/api/v1/holds', jsonParser, (request, response) => {
    fetch(`http://koha:8081/api/v1/checkouts/${request.body.checkoutId}`, {
      method: 'PUT',
      headers: {
        'Cookie': request.session.kohaSession
      }
    }).then(res => {
      if (res.status === 200) {
        response.sendStatus(200)
      } else {
        throw Error('Could not extend reservation')
      }
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })
}
