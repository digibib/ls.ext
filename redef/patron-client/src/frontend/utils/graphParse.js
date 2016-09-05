import graph from 'ld-graph'

import { relativeUri, getId } from './uriParser'

export function parsePersonResponse (personResponse, worksResponse) {
  const personGraph = worksResponse
    ? graph.parse(worksResponse, personResponse)
    : graph.parse(personResponse)
  const personResource = personGraph.byType('Person')[ 0 ]
  const person = {}

  populateLiteral(person, 'personTitle', personResource)
  populateLiteral(person, 'name', personResource)
  populateLiteral(person, 'birthYear', personResource)
  populateLiteral(person, 'deathYear', personResource)
  populateUri(person, 'nationality', personResource)

  person.works = []
  personGraph.byType('Work').forEach(workResource => {
    const work = {}
    populateLiteral(work, 'mainTitle', workResource)
    populateLiteral(work, 'partTitle', workResource)
    work.relativeUri = relativeUri(workResource.id)
    person.works.push(work)
  })

  person.uri = personResource.id

  return person
}

export function parseWorkResponse (workResponse, itemsResponse) {
  const workGraph = itemsResponse
    ? graph.parse(workResponse, itemsResponse)
    : graph.parse(workResponse)

  const workResource = workGraph.byType('Work')[ 0 ]
  const work = {}
  populateLiteral(work, 'mainTitle', workResource)
  populateLiteral(work, 'partTitle', workResource)
  populateLiteral(work, 'publicationYear', workResource)
  populateLiteral(work, 'language', workResource)
  populateUri(work, 'audience', workResource)
  work.items = []

  work.contributors = {}
  workResource.outAll('contributor').forEach(contribution => {
    work.contributors[ contribution.out('role').id ] = work.contributors[ contribution.out('role').id ] || []
    work.contributors[ contribution.out('role').id ].push({
      name: contribution.out('agent').get('name').value,
      relativeUri: relativeUri(contribution.out('agent').id)
    })
  })

  work.genres = []
  workResource.outAll('genre').forEach(genreResource => {
    const genre = {}
    populateLiteral(genre, 'prefLabel', genreResource)
    populateLiteral(genre, 'genreSubdivision', genreResource)
    work.genres.push(genre)
  })

  work.subjects = []
  workResource.outAll('subject').forEach(subjectResource => {
    const subject = {}
    populateLiteral(subject, 'prefLabel', subjectResource)
    populateLiteral(subject, 'specification', subjectResource)
    work.subjects.push(subject)
  })

  work.publications = []
  workGraph.byType('Publication').forEach(publicationResource => {
    const publication = {}
    populateLiteral(publication, 'mainTitle', publicationResource)
    populateLiteral(publication, 'partTitle', publicationResource)
    populateLiteral(publication, 'publicationYear', publicationResource)
    populateLiteral(publication, 'isbn', publicationResource)
    populateLiteral(publication, 'numberOfPages', publicationResource)
    populateLiteral(publication, 'edition', publicationResource)
    populateUri(publication, 'binding', publicationResource)
    populateLiteral(publication, 'recordID', publicationResource, 'recordId')
    populateUris(publication, 'language', publicationResource, 'languages')
    populateUris(publication, 'format', publicationResource, 'formats')
    populateUris(publication, 'mediaType', publicationResource, 'mediaTypes')
    publication.uri = publicationResource.id
    publication.id = getId(publicationResource.id)
    populateItems(publication, 'items', publicationResource.inAll('editionOf'))
    work.items.push.apply(work.items, publication.items)
    publication.available = publication.items.filter(item => item.status === 'Ledig').length > 0
    populateLiteral(publication, 'hasImage', publicationResource, 'image')

    if (publication.image) {
      // choose any available image
      work.image = work.image || publication.image
    }

    work.publications.push(publication)
  })

  work.uri = workResource.id

  return work
}

function populateItems (target, field, itemResources) {
  const items = {}
  itemResources.forEach(itemResource => {
    const item = {
      languages: target.languages || [],
      mediaType: target.mediaTypes
    }
    populateLiteral(item, 'shelfmark', itemResource)
    populateLiteral(item, 'status', itemResource)
    populateLiteral(item, 'location', itemResource)
    populateLiteral(item, 'branch', itemResource)
    populateLiteral(item, 'barcode', itemResource)
    const key = `${item.branch}_${item.shelfmark}`
    if (!items[ key ]) {
      item.available = 0
      item.total = 0
      items[ key ] = item
    }
    if (item.status === 'Ledig') {
      items[ key ].available++
    }
    items[ key ].total++
  })
  const targetField = target[field] = []
  Object.keys(items).forEach(key => {
    targetField.push(items[ key ])
  })
}

function populateLiteral (target, field, sourceResource, targetFieldOverride) {
  target[ field ] = ''
  if (sourceResource.has(field)) {
    target[ targetFieldOverride || field ] = sourceResource.get(field).value
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
    target[ targetFieldOverride || field ].push(resource.id)
  })
}
