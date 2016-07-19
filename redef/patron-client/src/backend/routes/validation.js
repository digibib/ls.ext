const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const validator = require('../utils/validator')

module.exports = (app) => {
  app.post('/api/v1/validation', jsonParser, (request, response) => {
    const validationResults = validator(request.body.values)
    response.send({ errors: validationResults })
  })
}
