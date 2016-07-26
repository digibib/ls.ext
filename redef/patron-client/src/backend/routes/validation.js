const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const extendedValidator = require('../utils/extendedValidator')

module.exports = (app) => {
  app.post('/api/v1/validation', jsonParser, (request, response) => {
    const validationResults = extendedValidator()(request.body.values)
    response.send({ errors: validationResults })
  })
}
