import { relativeUri, getId } from './uriParser'
import Constants from '../constants/Constants'

export function processSearchResponse (response, locationQuery) {
  const processedResponse = {}
  if (response.error) {
    processedResponse.error = response.error
  } else {
    const filteredLanguages = []
    processedResponse.filters = processAggregationsToFilters(response, locationQuery, filteredLanguages)
    const searchResults = response.aggregations.byWork.buckets.map(element => {
      const result = {}

      result.workUri = element.key
      result.id = getId(result.workUri)
      result.relativeUri = relativeUri(result.workUri)
      result.publication = element.publications.hits.hits[ 0 ]._source
      result.publication.contributors = result.publication.contributors || []
      result.publication.contributors = result.publication.contributors.filter(contributor => {
        return contributor.mainEntry
      })
      result.publication.contributors.forEach(contributor => {
        contributor.agent.relativeUri = relativeUri(contributor.agent.uri)
      })

      let selected // will be our selected publication for display, based on language criteria

      // If there is an active language filter, choose a publication that matches language
      // according to the preferred list.
      if (filteredLanguages.length > 0) {
        for (const prefLang of Constants.preferredLanguages) {
          for (const filterLang of filteredLanguages) {
            if (prefLang === filterLang && result.publication.langTitles[ prefLang ]) {
              // There might be several publications in the same language. We choose the first.
              selected = result.publication.langTitles[ prefLang ][ 0 ]
              break
            }
          }
          if (selected) {
            break
          }
        }
      }

      if (!selected) {
        // If the search query has match in the publication which elasticsearch returns as best match, use that.
        const titles = `${result.publication.mainTitle} ${result.publication.subtitle} ${result.publication.partNumber} ${result.publication.partTitle}`
        if (titles.toLocaleLowerCase().includes(locationQuery.query.toLocaleLowerCase())) {
          selected = result.publication
        }
      }

      if (!selected) {
        // We still haven't selected a publication, choose one among the available,
        // according to the list of preferred languages.
        for (const prefLang of Constants.preferredLanguages) {
          if (result.publication.langTitles[ prefLang ]) {
            // There might be several publications in the same language. We choose the first.
            selected = result.publication.langTitles[ prefLang ][ 0 ]
            break
          }
        }
      }

      if (!selected) {
        // Still no match, use the publication which elasticsearch returns as best match
        selected = result.publication
      }

      if (selected.subtitle) {
        result.titleLine1 = `${selected.mainTitle} : ${selected.subtitle}`
      } else {
        result.titleLine1 = selected.mainTitle
      }
      if (selected.partNumber && selected.partTitle) {
        result.titleLine2 = `${selected.partNumber}. ${selected.partTitle}`
      } else if (selected.partNumber) {
        result.titleLine2 = selected.partNumber
      } else if (selected.partTitle) {
        result.titleLine2 = selected.partTitle
      } else {
        result.titleLine2 = ''
      }

      if (selected.pubUri) {
        result.relativePublicationUri = `${result.relativeUri}${relativeUri(selected.pubUri)}`
      } else {
        result.relativePublicationUri = `${result.relativeUri}${relativeUri(result.publication.uri)}`
      }

      result.mediaTypes = result.publication.mediaTypesFromAllPublications || []
      result.image = selected.image
      if (!result.image) {
        // Choose any available based on preferred languages
        for (let i = 0; i < Constants.preferredLanguages.lengh; i++) {
          const prefLang = Constants.preferredLanguages[ i ]
          if (result.publication.langTitles[ prefLang ] && result.publication.langTitles[ prefLang ].image) {
            result.image = result.publication.langTitles[ prefLang ].image
            break
          }
        }
      }

      return result
    })
    processedResponse.searchResults = searchResults
    processedResponse.totalHits = response.aggregations.workCount.value
    processedResponse.totalHitsPublications = response.hits.total
  }
  return processedResponse
}

export function processAggregationsToFilters (response, locationQuery, filteredLanguages) {
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
        if (active && filterId.startsWith('language')) {
          filteredLanguages.push(bucket.key)
        }
        filters.push({ id: filterId, bucket: bucket.key, count: bucket.doc_count, active: active })
      })
    }
  })

  return filters
}
