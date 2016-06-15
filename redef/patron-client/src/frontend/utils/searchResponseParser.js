import { relativeUri, getId } from './uriParser'
import Constants from '../constants/Constants'

function sample (array) {
  if (Array.isArray(array)) {
    return array[Math.floor(Math.random() * array.length)]
  }
}

export function processSearchResponse (response, locationQuery) {
  const processedResponse = {}
  if (response.error) {
    processedResponse.error = response.error
  } else {
    const searchResults = response.aggregations.byWork.buckets.map(element => {
      const result = {}

      result.workUri = element.key
      result.id = getId(result.workUri)
      result.relativeUri = relativeUri(result.workUri)
      result.publication = element.publications.hits.hits[0]._source.publication
      result.publication.contributors = result.publication.contributors || []
      result.publication.contributors.forEach(contributor => {
        contributor.agent.relativeUri = relativeUri(contributor.agent.uri)
      })
      result.relativePublicationUri = `${result.relativeUri}${relativeUri(result.publication.uri)}`

      result.image = result.publication.image || sample(result.publication.imagesFromAllPublications)

      result.displayTitle = result.publication.mainTitle
      if (result.publication.partTitle) {
        result.displayTitle += ` — ${result.publication.partTitle}`
      }

      if (!result.publication.mainTitle.includes(locationQuery.query)) {
        // The query does not match in title. This can happen f.ex when searching for author name
        // If possible - choose the norwegian or enlglish title for display:
        result.displayTitle = result.publication.norwegianTitle || result.publication.englishTitle || result.displayTitle

        // choose another image as well
        result.image = sample(result.publication.imagesFromAllPublications) || result.publication.image
      }

      return result
    })
    processedResponse.searchResults = searchResults
    processedResponse.totalHits = response.aggregations.workCount.value
    processedResponse.totalHitsPublications = response.hits.total
    processedResponse.filters = processAggregationsToFilters(response, locationQuery)
  }
  return processedResponse
}

export function processAggregationsToFilters (response, locationQuery) {
  const filters = []
  const filterParameters = locationQuery[ 'filter' ] instanceof Array ? locationQuery[ 'filter' ] : [ locationQuery[ 'filter' ] ]

  const facets = response.aggregations.facets
  Object.keys(Constants.filterableFields).forEach(fieldShortName => {
    const field = Constants.filterableFields[ fieldShortName ]
    const fieldName = field.name
    const aggregation = facets[ fieldName ][ fieldName ]
    if (aggregation) {
      aggregation.buckets.forEach(bucket => {
        const filterId = `${fieldShortName}_${bucket.key.substring(field.prefix.length)}`
        const filterParameter = filterParameters.find(filterParameter => filterParameter === filterId)
        const active = filterParameter !== undefined
        filters.push({ id: filterId, bucket: bucket.key, count: bucket.doc_count, active: active })
      })
    }
  })

  return filters
}
