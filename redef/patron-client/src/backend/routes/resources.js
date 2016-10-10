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
      }).then(ntdata => jsonld.fromRDF(ntdata, { format: 'application/nquads' }, (error, ntdoc) => {
        if (error) {
          throw error
        }
        jsonld.frame(ntdoc, frame, (error, framed) => {
          if (error) {
            throw error
          }
          try {
            response.status(200).send(transformResponse(framed[ '@graph' ][ 0 ]))
          } catch (error) {
            response.status(500).send(error)
          }
        })
      })
    ).catch(error => {
      response.sendStatus(500)
      console.log(error)
    })
  })

  app.get('/api/v1/resources/work/:workId/items', jsonParser, (request, response) => {
    fetch(`http://services:8005/work/${request.params.workId}/listRecordIds`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          response.status(res.status).send(res.statusText)
          throw Error()
        }
      }).then(json => Promise.all(json.recordIds.map(recordId => fetch(`http://xkoha:8081/api/v1/biblios/${recordId}/expanded`).then(res => res.json())))
      .then(itemResponses => {
        const itemsByRecordId = {}
        itemResponses.forEach(itemResponse => {
          const items = {}
          itemResponse.items.forEach(item => {
            const newItem = {
              shelfmark: item.itemcallnumber,
              status: item.status,
              branchcode: item.holdingbranch,
              barcode: item.barcode,
              location: item.location
            }
            const key = `${newItem.branch}_${newItem.shelfmark}_${item.location}`
            if (!items[ key ]) {
              newItem.available = 0
              newItem.total = 0
              items[ key ] = newItem
            }
            if (newItem.status === 'Ledig') {
              items[ key ].available++
            }
            items[ key ].total++
          })
          itemsByRecordId[ itemResponse.biblio.biblionumber ] = items
        })
        const itemsyo = {}
        Object.keys(itemsByRecordId).forEach(key => {
          itemsyo[ key ] = Object.keys(itemsByRecordId[ key ]).map(key2 => itemsByRecordId[ key ][ key2 ])
        })
        response.status(200).send(itemsyo)
      }).catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
    ).catch(error => {
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
  work.by = []
    .concat(work.contributors[ 'http://data.deichman.no/role#author' ])
    .concat(work.contributors[ 'http://data.deichman.no/role#director' ])
    .concat(work.contributors[ 'http://data.deichman.no/role#composer' ])
    .concat(work.contributors[ 'http://data.deichman.no/role#performer' ])
    .filter(by => by)
    .map(by => by.name)

  if (work.hasClassification) {
    work.deweyNumber = work.hasClassification.hasClassificationNumber
  }

  work.publications.forEach(publication => {
    publication.uri = publication.id
    publication.items = []
    publication.id = getId(publication.id)
    publication.inSerials = transformInSerials(publication.inSerials)
    if (publication.image) {
      // choose any available image
      work.image = work.image || publication.image
    }
    publication.contributors = transformContributors(publication.contributors)
    if (publication.publishedBy) {
      publication.publisher = publication.publishedBy.name
    }
    if (publication.hasPlaceOfPublication) {
      publication.placeOfPublication = publication.hasPlaceOfPublication.prefLabel
    }
  })

  work.serials = [].concat.apply([], work.publications.map(publication => publication.inSerials.map(inSerial => inSerial.name)))
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

function transformInSerials (input) {
  return input.map(inSerial => {
    return {
      uri: inSerial.serial.id,
      name: inSerial.serial.name
    }
  })
}

const urijs = require('urijs')

function relativeUri (uri) {
  return urijs(uri).path()
}

function getId (uri) {
  return uri.substring(uri.lastIndexOf('/') + 1)
}
