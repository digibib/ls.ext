const fetch = require('isomorphic-fetch')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
  app.put('/api/v1/checkouts', jsonParser, (request, response) => {
    fetch(`http://koha:8081/api/v1/checkouts/${request.body.checkoutId}`, {
      method: 'PUT',
      headers: {
        'Cookie': app.settings.kohaSession
      }
    }).then(res => {
      if (res.status === 200) {
        response.sendStatus(200)
      } else {
        throw Error('Could not extend loan')
      }
    }).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })
}
