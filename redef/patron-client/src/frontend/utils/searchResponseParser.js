import {getId, relativeUri} from './uriParser'
import Constants from '../constants/Constants'
import title from './title'

const titleCCLFields = Object
  .keys(Constants.queryFieldTranslations)
  .map(key => {return {key, value:Constants.queryFieldTranslations[ key ]}})
  .filter(translation => { return translation.value.title})
  .map(translation => { return translation.key})

function titleTermsFromQuery (query) {
  const keywords = query.toLocaleLowerCase().match(/\w+|:|"(?:\\"|[^"])+"/g) || []
  for (let i = 0; i < keywords.length; i++) {
    if (keywords[ i ] === ':') {
      keywords[ i ] = undefined
      if (!titleCCLFields.includes(keywords[ i - 1 ])) {
        keywords[ i + 1 ] = undefined
      }
      keywords[ i - 1 ] = undefined
    }
  }
  return keywords.filter(keyword => {return keyword !== undefined})
}

export function processSearchResponse (response, locationQuery) {
  const processedResponse = {}
  if (response.error) {
    processedResponse.error = response.error
  } else {
    const filteredLanguages = []
    processedResponse.filters = processAggregationsToFilters(response, locationQuery, filteredLanguages)
    const searchResults = response.hits.hits.map(element => {
      const result = {}
      result.workUri = element._source.uri
      result.id = getId(element._source.uri)
      result.relativeUri = relativeUri(result.workUri)
      if (element.inner_hits.publications.hits.hits.length > 0) {
        result.publication = element.inner_hits.publications.hits.hits[ 0 ]._source
        result.publication.contributors = result.publication.contributors || []
        result.publication.contributors = result.publication.contributors.filter(contributor => contributor.mainEntry)
        result.publication.contributors.forEach(contributor => {
          contributor.agent.relativeUri = relativeUri(contributor.agent.uri)
        })
      }

      let selected // will be our selected publication for display, based on language criteria
      // If there is an active language filter, choose a publication that matches language
      // according to the preferred list.
      selected = element.inner_hits.publications.hits.hits.find(pub => {
        return Constants.preferredLanguages.filter(prefLang => (filteredLanguages || []).includes(prefLang)).some(lang => (pub._source.languages || []).includes(lang))
      })

      if (!selected) {
        // If  the title of any preferred language contains the search query, use that title.
        const titleMatchTerms = titleTermsFromQuery(locationQuery.query)

        for (let prefLang of Constants.preferredLanguages) {
          let selectedByPrefLang = element.inner_hits.publications.hits.hits.find(pub => {
            const titles = `${pub._source.mainTitle} ${pub._source.subtitle} ${pub._source.partNumber} ${pub._source.partTitle}`
              .toLocaleLowerCase()
            return (pub._source.languages || []).includes(prefLang) &&
              titleMatchTerms.find(term => {return titles.includes(term)})
          })
          if (selectedByPrefLang) {
            selected = selectedByPrefLang
            break
          }
        }
      }

      if (selected) {
        result.title = title({
          mainTitle: selected._source.mainTitle,
          subtitle: selected._source.subtitle,
          partNumber: selected._source.partNumber,
          partTitle: selected._source.partTitle
        })
        if (selected._source.uri) {
          result.relativePublicationUri = `${result.relativeUri}${relativeUri(selected._source.uri)}`
        } else {
          result.relativePublicationUri = `${result.relativeUri}${relativeUri(result.publication.uri)}`
        }
        result.image = selected._source.image
        if (!result.image) {
          // Choose any available based on preferred languages
          for (let i = 0; i < Constants.preferredLanguages.length; i++) {
            const prefLang = Constants.preferredLanguages[ i ]
            if (result.publication.langTitles[ prefLang ] && result.publication.langTitles[ prefLang ].image) {
              result.image = result.publication.langTitles[ prefLang ].image
              break
            }
          }
        }
      } else {
        result.title = title({
          mainTitle: element._source.mainTitle,
          subtitle: element._source.subtitle,
          partNumber: element._source.partNumber,
          partTitle: element._source.partTitle
        })
      }

      result.mediaTypes = [ ... new Set(element.inner_hits.publications.hits.hits.filter(function (pub) {
        return pub._source.mediatype
      }).map(pub => (pub._source.mediatype ))) ].map(uri => ({ uri }))

      return result
    })
    processedResponse.searchResults = searchResults
    processedResponse.totalHits = response.hits.total
    processedResponse.totalHitsPublications = response.hits.hits.length
  }
  return processedResponse
}

export function processAggregationsToFilters (response, locationQuery, filteredLanguages) {
  const filters = []
  const filterParameters = locationQuery[ 'filter' ] instanceof Array ? locationQuery[ 'filter' ] : [ locationQuery[ 'filter' ] ]

  const facets = response.aggregations.facets
  const excludeUnavailable = locationQuery.hasOwnProperty('excludeUnavailable')

  Object.keys(Constants.filterableFields).forEach(fieldShortName => {
    if (excludeUnavailable && fieldShortName === 'homeBranch') {
      return
    }
    if (!excludeUnavailable && fieldShortName === 'availBranch') {
      return
    }
    const field = Constants.filterableFields[ fieldShortName ]
    const fieldName = field.name
    const aggregation = facets[ fieldName ]
    if (aggregation) {
      aggregation.buckets.forEach(bucket => {
        const filterId = `${fieldShortName}_${bucket.key.substring(field.prefix.length)}`
        const filterParameter = filterParameters.find(filterParameter => filterParameter === filterId)
        const active = filterParameter !== undefined
        if (active && filterId.startsWith('language')) {
          filteredLanguages.push(bucket.key)
        }
        filters.push({ id: filterId, bucket: bucket.key, count: bucket.parents.value, active: active })
      })
    }
  })

  return filters
}
