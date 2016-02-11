import urijs from 'urijs'

import { inPreferredLanguage } from '../utils/languageHelpers'

export function processSearchResponse (response) {
  let processedResponse = {}
  if (response.error) {
    processedResponse.error = response.error
  } else {
    let searchResults = response.hits.hits.map(element => {
      let work = element._source.work
      work.relativeUri = urijs(work.uri).path()
      work.creators = []
      if (work.creator) {
        // TODO handle more than one creators from Elasticsearch response
        work.creator.relativeUri = urijs(work.creator.uri).path()
        let creator = work.creator
        work.creators.push(creator)
      }
      // Choose preferred display language for properties with multiple languages
      work.mainTitle = inPreferredLanguage(work.mainTitle)
      work.partTitle = inPreferredLanguage(work.partTitle)
      return work
    })
    processedResponse.searchResults = searchResults
    processedResponse.totalHits = response.hits.total
  }

  return processedResponse
}

export function processAggregationResponse (response) {
  let processedResponse = {}
  let filters = []
  if (response.aggregations) {
    Object.keys(response.aggregations).forEach(key => {
      let aggregation = response.aggregations[ key ]
      aggregation.buckets.forEach(bucket => {
        filters.push({ aggregation: key, bucket: bucket.key, available: bucket.doc_count })
      })
    })
  }
  processedResponse.filters = filters
  return processedResponse
}
