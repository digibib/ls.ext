import { relativeUri } from './uriParser'
import Constants from '../constants/Constants'

export function processSearchResponse (response) {
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
      return work
    })
    processedResponse.searchResults = searchResults
    processedResponse.totalHits = response.hits.total
    processedResponse.filters = processAggregationResponse(response).filters
  }
  return processedResponse
}

export function processAggregationResponse (response) {
  let processedResponse = {}
  let filters = []
  if (response.aggregations && response.aggregations.all) {
    let all = response.aggregations.all
    Constants.filterableFields.forEach(field => {
      let aggregation = all[ field ][ field ][ field ] || all[ field ][ field ]
      if (aggregation) {
        aggregation.buckets.forEach(bucket => {
          filters.push({ aggregation: field, bucket: bucket.key, count: bucket.doc_count })
        })
      }
    })
  }
  processedResponse.filters = filters
  return processedResponse
}
