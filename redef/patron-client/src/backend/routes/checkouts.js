const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.put('/api/v1/checkouts', jsonParser, (request, response) => {
    fetch(`http://xkoha:8081/api/v1/checkouts/${request.body.checkoutId}`, {
      method: 'PUT'
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
