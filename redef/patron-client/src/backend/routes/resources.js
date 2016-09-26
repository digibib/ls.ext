const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.get('/api/v1/resources/work', jsonParser, (request, response) => {
    fetch(`http://services:8005/work/${request.body.id}`, {headers: {accept: 'application/n-triples;charset=utf-8'}})
    .then(res => {
      if (res.status === 200) {
        return res.text()
      } else {
        response.status(res.status).send(res.statusText)
        throw Error()
      }
    }).then(json => response.status(200).send(json))
      .catch(error => {
        console.log(error)
      })
  })
}
