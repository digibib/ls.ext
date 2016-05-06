import { relativeUri } from './uriParser'
import Constants from '../constants/Constants'

export function processSearchResponse (response, locationQuery) {
  let processedResponse = {}
  if (response.error) {
    processedResponse.error = response.error
  } else {
    let searchResults = response.hits.hits.map(element => {
      let work = element._source.work
      work.relativeUri = relativeUri(work.uri)

      work.contributors = work.contributors || []
      work.contributors.forEach(contributor => {
        contributor.agent.relativeUri = relativeUri(contributor.agent.uri)
      })

      work.subjects = work.subjects || []
      work.subjects.forEach(subject => {
        subject.searchQuery = `search?query=${subject.name}` // TODO: create expose specialiced query interface
      })

      work.publications = work.publications || []
      work.publications.forEach(publication => {
        publication.formats = publication.formats || []
        publication.languages = publication.languages || []
      })

      let chosenPublication = approximateBestTitle(work.publications, element.highlight)
      if (chosenPublication && chosenPublication.mainTitle) {
        work.mainTitle = chosenPublication.mainTitle
        work.partTitle = chosenPublication.partTitle
        work.relativeUri = `${work.relativeUri}${relativeUri(chosenPublication.uri)}`
      }

      return work
    })
    processedResponse.searchResults = searchResults
    processedResponse.totalHits = response.hits.total
    processedResponse.filters = processAggregationsToFilters(response, locationQuery)
  }
  return processedResponse
}

export function processAggregationsToFilters (response, locationQuery) {
  let filters = []
  if (response.aggregations && response.aggregations.all) {
    let all = response.aggregations.all
    Constants.filterableFields.forEach(field => {
      let aggregation = all[ field ][ field ][ field ]
      if (aggregation) {
        aggregation.buckets.forEach(bucket => {
          let aggregationFilter = locationQuery[ 'filter_' + field ]
          let active = aggregationFilter instanceof Array
            ? aggregationFilter.includes(bucket.key)
            : aggregationFilter === bucket.key
          filters.push({ aggregation: field, bucket: bucket.key, count: bucket.doc_count, active: active })
        })
      }
    })
  }
  return filters
}

export function approximateBestTitle (publications, highlight) {
  highlight = highlight || []
  highlight[ 'work.publications.mainTitle' ] = highlight[ 'work.publications.mainTitle' ] || []
  highlight[ 'work.publications.partTitle' ] = highlight[ 'work.publications.partTitle' ] || []

  let filteredPublications = publications.filter(publication => {
    return (
      highlight[ 'work.publications.mainTitle' ].includes(publication.mainTitle) ||
      highlight[ 'work.publications.partTitle' ].includes(publication.partTitle)
    )
  })
  return (
    filteredPublications.filter(publication => publication.languages.includes('http://lexvo.org/id/iso639-3/nob'))[ 0 ] ||
    filteredPublications.filter(publication => publication.languages.includes('http://lexvo.org/id/iso639-3/eng'))[ 0 ] ||
    filteredPublications[ 0 ] ||
    publications.filter(publication => publication.languages.includes('http://lexvo.org/id/iso639-3/nob'))[ 0 ] ||
    publications.filter(publication => publication.languages.includes('http://lexvo.org/id/iso639-3/eng'))[ 0 ] ||
    publications[ 0 ]
  )
}
