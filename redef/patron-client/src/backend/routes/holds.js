const fetch = require('isomorphic-fetch')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {

  app.post('/holds', jsonParser, (request, response) => {
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
}