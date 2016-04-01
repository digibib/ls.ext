import graph from 'ld-graph'

import { relativeUri } from './uriParser'

export function parsePersonResponse (personUri, personResponse, worksResponse) {
  let personGraph = worksResponse
    ? graph.parse(worksResponse, personResponse)
    : graph.parse(personResponse)
  let personResource = personGraph.byType('Person')[ 0 ]
  let person = {}

  populateLiteral(person, 'personTitle', personResource)
  populateLiteral(person, 'name', personResource)
  populateLiteral(person, 'birthYear', personResource)
  populateLiteral(person, 'deathYear', personResource)
  populateUri(person, 'nationality', personResource)

  person.works = []
  personGraph.byType('Work').forEach(workResource => {
    let work = {}
    populateLabelsByLanguage(work, 'mainTitle', workResource)
    populateLabelsByLanguage(work, 'partTitle', workResource)
    work.relativeUri = relativeUri(workResource.id)
    person.works.push(work)
  })

  person.uri = personResource.id

  return person
}

export function parseWorkResponse (workUri, workResponse, itemsResponse) {
  let workGraph = itemsResponse
    ? graph.parse(workResponse, itemsResponse)
    : graph.parse(workResponse)

  let workResource = workGraph.byType('Work')[ 0 ]
  let work = {}

  // TODO: availCount
  populateLabelsByLanguage(work, 'mainTitle', workResource)
  populateLabelsByLanguage(work, 'partTitle', workResource)
  populateLiteral(work, 'publicationYear', workResource)

  work.creators = []
  workResource.outAll('creator').forEach(creatorResource => {
    let creator = {}
    populateLiteral(creator, 'name', creatorResource)
    creator.relativeUri = relativeUri(creatorResource.id)
    work.creators.push(creator)
  })

  work.publications = []
  work.items = []
  workGraph.byType('Publication').forEach(publicationResource => {
    let publication = {}
    populateLiteral(publication, 'mainTitle', publicationResource)
    populateLiteral(publication, 'partTitle', publicationResource)
    populateLiteral(publication, 'publicationYear', publicationResource)
    populateUri(publication, 'language', publicationResource)
    populateUri(publication, 'format', publicationResource)
    publication.id = publicationResource.id
    publication.itemsCount = 0
    publicationResource.inAll('editionOf').map(itemResource => {
      publication.itemsCount++
      let item = {}
      populateLiteral(item, 'location', itemResource)
      populateLiteral(item, 'status', itemResource)
      populateLiteral(item, 'barcode', itemResource)
      populateLiteral(item, 'shelfmark', itemResource)
      item.title = publication.mainTitle
      if (publication.partTitle) {
        item.title += ' — ' + publication.partTitle
      }
      item.language = publication.language
      item.format = publication.format
      work.items.push(item)
    })
    work.publications.push(publication)
  })

  work.uri = workResource.id

  return work
}

function populateLiteral (target, field, sourceResource) {
  target[ field ] = ''
  if (sourceResource.has(field)) {
    target[ field ] = sourceResource.get(field).value
  }
}

function populateUri (target, field, sourceResource) {
  target[ field ] = ''
  if (sourceResource.hasOut(field)) {
    target[ field ] = sourceResource.out(field).id
  }
}

function populateLabelsByLanguage (target, field, sourceResource) {
  target[ field ] = {}
  sourceResource.getAll(field).map(literal => {
    target[ field ][ literal.lang ] = literal.value
  })
}
