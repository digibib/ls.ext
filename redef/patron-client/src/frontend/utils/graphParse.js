import graph from 'ld-graph'

import { relativeUri, getId } from './uriParser'

export function parsePersonResponse (personResponse, worksResponse) {
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
    populateLiteral(work, 'mainTitle', workResource)
    populateLiteral(work, 'partTitle', workResource)
    work.relativeUri = relativeUri(workResource.id)
    person.works.push(work)
  })

  person.uri = personResource.id

  return person
}

export function parseWorkResponse (workResponse, itemsResponse) {
  let workGraph = itemsResponse
    ? graph.parse(workResponse, itemsResponse)
    : graph.parse(workResponse)

  let workResource = workGraph.byType('Work')[ 0 ]
  let work = {}
  populateLiteral(work, 'mainTitle', workResource)
  populateLiteral(work, 'partTitle', workResource)
  populateLiteral(work, 'publicationYear', workResource)

  work.creators = []
  workResource.outAll('creator').forEach(creatorResource => {
    let creator = {}
    populateLiteral(creator, 'name', creatorResource)
    creator.relativeUri = relativeUri(creatorResource.id)
    work.creators.push(creator)
  })

  work.genres = []
  workResource.outAll('genre').forEach(genreResource => {
    let genre = {}
    populateLiteral(genre, 'name', genreResource)
    genre.relativeUri = relativeUri(genreResource.id)
    work.genres.push(genre)
  })

  work.subjects = []
  workResource.outAll('subject').forEach(subjectResource => {
    let subject = {}
    populateLiteral(subject, 'name', subjectResource)
    subject.relativeUri = relativeUri(subjectResource.id)
    work.subjects.push(subject)
  })

  work.publications = []
  workGraph.byType('Publication').forEach(publicationResource => {
    let publication = { items: [] }
    populateLiteral(publication, 'mainTitle', publicationResource)
    populateLiteral(publication, 'partTitle', publicationResource)
    populateLiteral(publication, 'publicationYear', publicationResource)
    populateUris(publication, 'language', publicationResource, 'languages')
    populateUris(publication, 'format', publicationResource, 'formats')
    publication.uri = publicationResource.id
    publication.id = getId(publicationResource.id)
    let items = {}
    publicationResource.inAll('editionOf').map(itemResource => {
      let item = {}
      populateLiteral(item, 'shelfmark', itemResource)
      populateLiteral(item, 'status', itemResource)
      populateLiteral(item, 'location', itemResource)
      let key = `${item.location}_${item.shelfmark}`
      if (items[ key ]) {
        items[ key ].count++
        if (item.status === 'AVAIL') {
          items[ key ].status = 'AVAIL'
        } else {
          let date = new Date(item.status)
          if (items[ key ].status !== 'AVAIL' && !isNaN(date.getTime()) && date < items[ key ].status) {
            items[ key ].status = date
          }
        }
      } else {
        populateLiteral(item, 'branch', itemResource)
        populateLiteral(item, 'barcode', itemResource)
        item.count = 1
        items[ key ] = item
      }
    })
    Object.keys(items).forEach(key => {
      publication.items.push(items[ key ])
    })
    publication.available = publication.items.filter(item => item.status === 'AVAIL').length > 0

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

function populateUri (target, field, sourceResource, targetFieldOverride) {
  target[ targetFieldOverride || field ] = ''
  if (sourceResource.hasOut(field)) {
    target[ targetFieldOverride || field ] = sourceResource.out(field).id
  }
}

function populateUris (target, field, sourceResource, targetFieldOverride) {
  target[ targetFieldOverride || target ] = []
  sourceResource.outAll(field).forEach(resource => {
    target[ targetFieldOverride || target ].push(resource.id)
  })
}
