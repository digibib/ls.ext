const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const jsonld = require('jsonld')
const fs = require('fs')
const path = require('path')
const frame = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'misc', 'frame.json')))

module.exports = (app) => {
  const fetch = require('../fetch')(app)

  app.get('/api/v1/translations/:lang', jsonParser, (request, response) => {
    fetch(`http://services:8005/translations/${request.params.lang}`, { headers: { accept: 'application/json' } })
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          return Promise.reject(`error fetching translations for ${request.params.lang}: ${res.statusText}`)
        }
      })
      .then(res => response.status(200).send(res))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.get('/api/v1/resources/person/:personId', jsonParser, (request, response) => {
    fetch(`http://services:8005/person/${request.params.personId}`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          return Promise.reject(`error fetching person ${request.params.personId}: ${res.statusText}`)
        }
      })
      .then(person => response.status(200).send(person))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.get('/api/v1/resources/person/:personId/works', jsonParser, (request, response) => {
    fetch(`http://services:8005/person/${request.params.personId}/works`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          return Promise.reject(`error fetching person ${request.params.personId}: ${res.statusText}`)
        }
      })
      .then(person => response.status(200).send(person))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.get('/api/v1/resources/work/:workId', jsonParser, (request, response) => {
    fetch(`http://services:8005/work/${request.params.workId}`, { headers: { accept: 'application/n-triples;charset=utf-8' } })
      .then(res => {
        if (res.status === 200) {
          return res.text()
        } else {
          return Promise.reject(`error fetching work ${request.params.workId}: ${res.statusText}`)
        }
      })
      .then(ntdata => parseRDFtoJsonLD(ntdata, request.params.workId))
      .then(ntdoc => frameJsonLD(ntdoc))
      .then(work => response.status(200).send(work))
      .catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
  })

  app.get('/api/v1/resources/work/:workId/items', jsonParser, (request, response) => {
    fetch(`http://services:8005/work/${request.params.workId}/listRecordIds`)
      .then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          return Promise.reject(`error fetching items for work ${request.params.workId}: ${res.statusText}`)
        }
      }).then(json => Promise.all(json.recordIds.map(recordId => fetch(`http://xkoha:8081/api/v1/biblios/${recordId}/expanded`).then(res => {
        if (res.status === 200) {
          return res.json()
        } else {
          return Promise.resolve(undefined)
        }
      }))).then(itemResponses => {
        const itemsByRecordId = {}
        const holdsByRecordId = {}
        itemResponses.filter(itemResponse => itemResponse).forEach(itemResponse => {
          holdsByRecordId[ itemResponse.biblio.biblionumber ] = itemResponse.biblio
          const items = {}
          itemResponse.items.forEach(item => {
            if (item.status === 'Utilgjengelig') {
              // Theese items should not count, or be processed further,
              // as they are not available to end users.
              return
            }
            const newItem = {
              shelfmark: item.itemcallnumber,
              status: item.status,
              reservable: item.reservable === 1,
              branchcode: item.homebranch,
              barcode: item.barcode,
              location: item.location,
              notforloan: item.status === 'Ikke til hjemlån' || item.status === 'Ikke til hjemlån (utlånt)',
              notforloanAndCheckedOut: item.status === 'Ikke til hjemlån (utlånt)'
            }
            const key = `${newItem.branchcode}_${newItem.shelfmark}_${newItem.location}_${newItem.notforloan}`
            if (!items[ key ]) {
              newItem.available = 0
              newItem.total = 0
              items[ key ] = newItem
            }
            if (newItem.status === 'Ledig' || (newItem.notforloan && !newItem.notforloanAndCheckedOut)) {
              items[ key ].available++
            }
            items[ key ].total++
            if (newItem.reservable) {
              items[ key ].reservable = true
            }
          })
          itemsByRecordId[ itemResponse.biblio.biblionumber ] = items
        })
        const publications = {}
        Object.keys(itemsByRecordId).forEach(key => {
          publications[ key ] = {
            items: Object.keys(itemsByRecordId[ key ]).map(key2 => itemsByRecordId[ key ][ key2 ])
          }
        })
        Object.keys(holdsByRecordId).forEach(recordId => {
          publications[ recordId ].numHolds = holdsByRecordId[ recordId ].numholds
        })
        response.status(200).send(publications)
      }).catch(error => {
        console.log(error)
        response.sendStatus(500)
      })
    ).catch(error => {
      console.log(error)
      response.sendStatus(500)
    })
  })
}

function parseRDFtoJsonLD (ntdata, workId) {
  return new Promise((resolve, reject) => {
    jsonld.fromRDF(ntdata, { format: 'application/nquads' }, (error, ntdoc) => {
      if (error) {
        reject(error)
      }

      // We need to add a class to the work 'in focus', in case there are other works
      // in the graph (for example work as subject of work), and use this class
      // for framing.
      //
      // We also delete the class migration:Work, as it trips up the framing.
      ntdoc = ntdoc.map(el => {
        if (el[ '@type' ] && el[ '@type' ].includes('http://data.deichman.no/ontology#Work') && el[ '@id' ] === `http://data.deichman.no/work/${workId}`) {
          el[ '@type' ].push('http://data.deichman.no/ontology#WorkInFocus')
        }
        if (el[ '@type' ]) {
          const i = el[ '@type' ].indexOf('http://migration.deichman.no/Work')
          if (i !== -1) {
            el[ '@type' ].splice(i, 1)
          }
        }

        return el
      })

      resolve(ntdoc)
    })
  })
}

function frameJsonLD (ntdoc) {
  return new Promise((resolve, reject) => {
    jsonld.frame(ntdoc, frame, (error, framedJson) => {
      if (error) {
        reject(error)
      }
      try {
        // error in transformWork will end up in Promise.catch and return 500
        const work = transformWork(framedJson[ '@graph' ][ 0 ])
        resolve(work)
      } catch (error) {
        reject(error)
      }
    })
  })
}

function transformWork (input) {
  try {
    const workRelations = transformWorkRelations(input.isRelatedTo)
    const workSeries = transformWorkSeries(input.isPartOfWorkSeries)
    const contributors = transformContributors(input.contributors)
    const work = {
      _original: process.env.NODE_ENV !== 'production' ? input : undefined,
      audiences: input.audiences,
      biographies: input.biographies,
      by: transformBy(contributors),
      classifications: transformClassifications(input.classifications),
      compositionTypes: transformCompositionType(input.hasCompositionType),
      contentAdaptations: input.contentAdaptations,
      contributors: contributors,
      workRelations: workRelations,
      workSeries: workSeries,
      deweyNumber: input.hasClassification ? input.hasClassification.hasClassificationNumber : undefined,
      fictionNonfiction: input.fictionNonfiction,
      genres: input.genres,
      hasSummary: input.hasSummary,
      id: getId(input.id),
      instrumentations: transformInstrumentation(input.hasInstrumentation),
      items: [],
      languages: input.languages,
      literaryForms: input.literaryForms,
      mainTitle: input.mainTitle,
      partNumber: input.partNumber,
      partTitle: input.partTitle,
      untranscribedTitle: input.untranscribedTitle,
      publicationYear: input.publicationYear,
      publications: transformPublications(input.publications),
      serials: transformSerials(input),
      subtitle: input.subtitle,
      subjects: input.subjects,
      uri: input.id,
      countryOfOrigin: input.nationality ? input.nationality.id : undefined,
      keys: input.key || []
    }
    const publicationWithImage = work.publications.find(publication => publication.image)
    if (publicationWithImage) {
      work.image = publicationWithImage.image
    }
    return work
  } catch (error) {
    throw new Error(error)
  }
}

function transformPublications (publications) {
  return publications.map(publication => {
    return {
      ageLimit: publication.ageLimit,
      binding: publication.binding,
      contentAdaptations: publication.contentAdaptations,
      contributors: transformContributors(publication.contributors),
      notes: ensureArray(publication.description),
      duration: publication.duration,
      ean: publication.ean,
      edition: publication.edition,
      extents: publication.extents || [],
      formatAdaptations: publication.formatAdaptations,
      formats: publication.formats,
      genres: publication.genres,
      id: getId(publication.id),
      image: publication.image,
      isbn: publication.isbn,
      items: [],
      languages: publication.languages,
      mainTitle: publication.mainTitle,
      mediaTypes: publication.mediaTypes,
      numberOfPages: publication.numberOfPages || [],
      partNumber: publication.partNumber,
      partTitle: publication.partTitle,
      placeOfPublication: publication.hasPlaceOfPublication ? publication.hasPlaceOfPublication.prefLabel : undefined,
      publicationParts: transformPublicationParts(publication.publicationParts),
      publicationYear: publication.publicationYear,
      publisher: publication.publishedBy ? publication.publishedBy.name : undefined,
      publishers: publication.publishers,
      recordId: publication.recordId,
      serialIssues: transformSerialIssues(publication.serialIssues),
      subtitle: publication.subtitle,
      subtitles: publication.subtitles,
      uri: publication.id,
      untranscribedTitle: publication.untranscribedTitle
    }
  })
}

function transformPublicationParts (input) {
  try {
    return input.map(inputPublicationPart => {
      return {
        mainEntry: inputPublicationPart.agent ? inputPublicationPart.agent.name : undefined,
        partTitle: inputPublicationPart.mainTitle,
        startsAtPage: Number(inputPublicationPart.startsAtPage) || inputPublicationPart.startsAtPage,
        endsAtPage: Number(inputPublicationPart.endsAtPage) || inputPublicationPart.endsAtPage,
        partNumber: inputPublicationPart.partNumber
      }
    })
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformSerials (work) {
  try {
    return [].concat(...work.publications.map(publication => publication.serialIssues.map(inSerial => inSerial.name)))
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformContributors (input) {
  try {
    const contributors = {}
    input.forEach(inputContributor => {
      const contributor = inputContributor.agent
      contributor.mainEntry = inputContributor.type.includes('MainEntry')
      contributor.uri = contributor.id
      contributor.id = getId(contributor.id)
      contributor.relativeUri = relativeUri(contributor.uri)
      if (contributor.specification) {
        contributor.name += ` (${contributor.specification})`
      }
      contributors[ inputContributor.role ] = contributors[ inputContributor.role ] || []
      contributors[ inputContributor.role ].push(contributor)
    })
    return contributors
  } catch (error) {
    console.log(error)
    return {}
  }
}

function transformWorkRelations (input) {
  try {
    const workRelations = {}
    input.forEach(inputWorkRelation => {
      const relatedWork = inputWorkRelation.work
      relatedWork.numberInRelation = inputWorkRelation.partNumber
      relatedWork.uri = relatedWork.id
      relatedWork.id = getId(relatedWork.id)
      relatedWork.relativeUri = relativeUri(relatedWork.uri)
      workRelations[ inputWorkRelation.hasRelationType ] = workRelations[ inputWorkRelation.hasRelationType ] || []
      workRelations[ inputWorkRelation.hasRelationType ].push(relatedWork)
    })
    return workRelations
  } catch (error) {
    console.log(error)
    return {}
  }
}

function transformWorkSeries (input) {
  try {
    const workSeries = []
    input.forEach(input => {
      const serie = input.workSeries
      serie.uri = serie.id
      serie.id = getId(serie.id)
      serie.relativeUri = relativeUri(serie.uri)
      serie.numberInSeries = input.partNumber
      workSeries.push(serie)
    })
    return workSeries
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformSerialIssues (input) {
  try {
    return input.map(serialIssue => {
      return {
        uri: serialIssue.serial.id,
        name: serialIssue.serial.mainTitle,
        subtitle: serialIssue.serial.subtitle,
        issue: serialIssue.issue
      }
    })
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformBy (contributors) {
  try {
    return []
      .concat(contributors[ 'http://data.deichman.no/role#author' ])
      .concat(contributors[ 'http://data.deichman.no/role#director' ])
      .concat(contributors[ 'http://data.deichman.no/role#composer' ])
      .concat(contributors[ 'http://data.deichman.no/role#performer' ])
      .filter(by => by)
      .filter(by => by.mainEntry)
      .map(by => by.name)
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformCompositionType (hasCompositionType = []) {
  try {
    return hasCompositionType.map(compositionType => compositionType.prefLabel)
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformInstrumentation (instrumentation = []) {
  try {
    return instrumentation.map(i => {
      return {
        instrument: i.hasInstrument.prefLabel,
        number: i.hasNumberOfPerformers
      }
    })
  } catch (error) {
    console.log(error)
    return []
  }
}

function transformClassifications (input) {
  try {
    return input.map(classification => classification.hasClassificationNumber)
  } catch (error) {
    console.log(error)
    return []
  }
}

const urijs = require('urijs')

function relativeUri (uri) {
  return urijs(uri).path()
}

function getId (uri) {
  return uri.substring(uri.lastIndexOf('/') + 1)
}

function ensureArray (obj) {
  if (!obj) {
    return []
  }
  if (Array.isArray(obj)) {
    return obj
  }
  return [obj]
}
