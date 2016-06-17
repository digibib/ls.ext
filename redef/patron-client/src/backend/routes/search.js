const fetch = require('isomorphic-fetch')
const searchBuilder = require('../utils/searchBuilder')

module.exports = (app) => {
  app.get('/q', (request, response) => {
    const queryString = request.originalUrl.substr(request.originalUrl.indexOf('?') + 1)
    fetch('http://elasticsearch:9200/search/publication/_search', {
      method: 'POST',
      body: JSON.stringify(searchBuilder.buildQuery(queryString))
    }).then(res => {
      if (res.ok) {
        return res.text()
      } else {
        response.status(res.status).send(res.statusText)
        throw Error(res.json())
      }
    }).then(json => response.status(200).send(json))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })
}
