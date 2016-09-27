const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const jsonld = require('jsonld');
const fs = require('fs')
const path = require('path')
const frame = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'misc', 'frame.json')))

module.exports = (app) => {
  const fetch = require('../fetch')(app)
  app.get('/api/v1/resources/work/:workId', jsonParser, (request, response) => {
    fetch(`http://services:8005/work/${request.params.workId}`, { headers: { accept: 'application/n-triples;charset=utf-8' } })
      .then(res => {
        if (res.status === 200) {
          return res.text()
        } else {
          response.status(res.status).send(res.statusText)
          throw Error()
        }
      }).then(ntdata => {
      jsonld.fromRDF(ntdata, { format: 'application/nquads' }, (error, ntdoc) => {
        if (error) {
          throw error
        }
        jsonld.frame(ntdoc, frame, (error, framed) => {
          response.status(200).send(framed['@graph'][0])
        })
      })
    })
      .catch(error => {
        console.log(error)
      })
  })
}
