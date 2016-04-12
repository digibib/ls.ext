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

      work.contributor = work.contributor || []
      work.contributor.forEach(contrib => {
        contrib.agent.relativeUri = relativeUri(contrib.agent.uri)
      })

      work.publications = work.publication || []
      if (!(work.publications instanceof Array)) {
        work.publications = [ work.publications ]
      }

      let chosenPublication = approximateBestTitle(work.publications, element.highlight)
      if (chosenPublication) {
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
  highlight[ 'work.publication.mainTitle' ] = highlight[ 'work.publication.mainTitle' ] || []
  highlight[ 'work.publication.partTitle' ] = highlight[ 'work.publication.partTitle' ] || []

  let filteredPublications = publications.filter(publication => {
    return (
      highlight[ 'work.publication.mainTitle' ].includes(publication.mainTitle) ||
      highlight[ 'work.publication.partTitle' ].includes(publication.partTitle)
    )
  })
  return (
    filteredPublications.filter(publication => publication.language === 'http://lexvo.org/id/iso639-3/nob')[ 0 ] ||
    filteredPublications.filter(publication => publication.language === 'http://lexvo.org/id/iso639-3/eng')[ 0 ] ||
    filteredPublications[ 0 ] ||
    publications.filter(publication => publication.language === 'http://lexvo.org/id/iso639-3/nob')[ 0 ] ||
    publications.filter(publication => publication.language === 'http://lexvo.org/id/iso639-3/eng')[ 0 ] ||
    publications[ 0 ]
  )
}
