const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const jsonld = require('jsonld')
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
            if (error) {
              throw error
            }
            response.status(200).send(transformResponse(framed[ '@graph' ][ 0 ]))
          })
        })
      }).catch(error => {
        response.sendStatus(500)
        console.log(error)
      })
  })
}

function transformResponse (work) {
  work.uri = work.id
  work.id = getId(work.id)
  // work.relativeUri = relativeUri(workResource.uri)
  work.items = []
  work.contributors = transformContributors(work.contributors)
  work.publications.forEach(publication => {
    publication.uri = publication.id
    publication.items = []
    publication.id = getId(publication.id)
    if (publication.image) {
      // choose any available image
      work.image = work.image || publication.image
    }
  })
  return work
}

function transformContributors (input) {
  const contributors = {}
  input.forEach(inputContributor => {
    const contributor = inputContributor.agent
    contributor.uri = contributor.id
    contributor.id = getId(contributor.id)
    contributor.relativeUri = relativeUri(contributor.uri)
    contributors[ inputContributor.role ] = contributors[ inputContributor.role ] || []
    contributors[ inputContributor.role ].push(contributor)
  })
  return contributors
}

const urijs = require('urijs')

function relativeUri (uri) {
  return urijs(uri).path()
}

function getId (uri) {
  return uri.substring(uri.lastIndexOf('/') + 1)
}
