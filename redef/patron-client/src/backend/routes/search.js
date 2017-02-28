const fetch = require('isomorphic-fetch')
const searchBuilder = require('../utils/searchBuilder')

module.exports = (app) => {
  app.get('/q', (request, response) => {
    const queryString = request.originalUrl.substr(request.originalUrl.indexOf('?') + 1)
    // fetch('http://elasticsearch:9200/search/publication/_search', {

    /*** DEV ONLY ***/
    // fetch('http://10.172.2.3:9200/search/publication/_search', {
    fetch('http://10.172.2.160:9200/search/publication/_search', {
      method: 'POST',
      body: JSON.stringify(searchBuilder.buildQuery(queryString))
    }).then(res => {
      if (res.ok) {
        return res.json()
      } else {
        return res.text().then(error => { return Promise.reject({ message: error, queryString: queryString }) })
      }
    }).then(json => response.status(200).send(json))
      .catch(error => {
        console.log(`Error in query: ${error.queryString}\n${error.message}`)
        response.sendStatus(500)
      })
  })
}
