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

      work.creators = []
      if (Array.isArray(work.creator)) {
        work.creators = work.creator
      } else if (work.creator) {
        work.creators.push(work.creator)
      }
      work.creators.forEach(creator => {
        creator.relativeUri = relativeUri(creator.uri)
      })

      work.publications = work.publication || []
      if (!(work.publications instanceof Array)) {
        work.publications = [ work.publications ]
      }

      let chosenPublication = approximateBestTitle(work.publications, locationQuery.query)
      if (chosenPublication) {
        work.mainTitle = chosenPublication.mainTitle
        work.partTitle = chosenPublication.partTitle
      }

      return work
    })
    processedResponse.searchResults = searchResults
    processedResponse.totalHits = response.hits.total
    processedResponse.filters = processAggregationResponse(response, locationQuery).filters
  }
  return processedResponse
}

export function processAggregationResponse (response, locationQuery) {
  let processedResponse = {}
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
  processedResponse.filters = filters
  return processedResponse
}

export function approximateBestTitle (publications, query) {
  query = query.toLowerCase()
  publications = publications.filter(publication => {
    return (publication.mainTitle && publication.mainTitle.toLowerCase().indexOf(query) > -1) ||
      (publication.partTitle && publication.partTitle.toLowerCase().indexOf(query) > -1)
  })
  let chosenPublication =
    publications.filter(publication => publication.language === 'http://lexvo.org/id/iso639-3/nob')[ 0 ] ||
    publications.filter(publication => publication.language === 'http://lexvo.org/id/iso639-3/eng')[ 0 ] ||
    publications[ 0 ]

  return chosenPublication
}
