import {getId, relativeUri} from './uriParser'
import Constants from '../constants/Constants'
import title from './title'

const titleCCLFields = Object
  .keys(Constants.queryFieldTranslations)
  .map(key => { return { key, value: Constants.queryFieldTranslations[ key ] } })
  .filter(translation => { return translation.value.title })
  .map(translation => { return translation.key })

function titleTermsFromQuery (query) {
  // strip out all ccl prefixes like "ht:", "mainTitle:" etc. If prefix is not among ccl prefixes for title related fields,
  // remove following term as well. Strip leading and trailing double quotes
  // e.g.: hovedtittel:"På gjengrodde stier" forfatter:"Hamsun, Knut" => ["På gjengrodde stier"]
  const keywords = query.toLocaleLowerCase().match(/\p{L}+|:|"(?:\\"|[^"])+"/g) || []
  for (let i = 0; i < keywords.length; i++) {
    if (keywords[ i ] === ':') {
      keywords[ i ] = undefined
      if (!titleCCLFields.includes(keywords[ i - 1 ])) {
        keywords[ i + 1 ] = undefined
      }
      keywords[ i - 1 ] = undefined
    }
  }
  return keywords
    .filter(keyword => { return keyword !== undefined })
    .map(titleExpr => { return titleExpr.replace(/^"|"$/g, '') })
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
      result.subject = element._source.subject
      result.genre = element._source.genre
      result.formats = []
      result.contributors = element._source.contributors || []
      result.contributors = result.contributors.filter(contributor => contributor.mainEntry)
      result.contributors.forEach(contributor => {
        contributor.agent.relativeUri = relativeUri(contributor.agent.uri)
      })
      if (element.inner_hits.publications.hits.hits.length > 0) {
        result.formats = [].concat.apply([], element.inner_hits.publications.hits.hits.map(pub => { return pub._source.formats || [] }))
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

        for (const prefLang of Constants.preferredLanguages) {
          const selectedByPrefLang = element.inner_hits.publications.hits.hits.find(pub => {
            return (pub._source.languages || []).includes(prefLang) &&
              titleMatchTerms.every(term => { return pub._source.displayLine1.toLocaleLowerCase().includes(term) })
          })
          if (selectedByPrefLang) {
            selected = selectedByPrefLang
            break
          }
        }
      }

      if (selected) {
        result.publication = selected
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
            const pubWithImage = element.inner_hits.publications.hits.hits.find(pub => {
              return pub._source.image && [].concat(...[ pub._source.languages || [] ]).includes(prefLang)
            })
            if (pubWithImage) {
              result.image = pubWithImage._source.image
              break
            }
          }
        }
      } else {
        result.publication = {}
        result.title = title({
          mainTitle: element._source.mainTitle,
          subtitle: element._source.subtitle,
          partNumber: element._source.partNumber,
          partTitle: element._source.partTitle
        })
      }

      result.mediaTypes = [ ...new Set(element.inner_hits.publications.hits.hits.filter(pub => pub._source.mediatype).map(pub => (pub._source.mediatype))) ].map(uri => ({ uri }))

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

  // merge work-level aggregations into facets
  response.aggregations.facets.audiences = response.aggregations.audiences
  response.aggregations.facets.fictionNonfiction = response.aggregations.fictionNonfiction

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
        filters.push({ id: filterId, bucket: bucket.key, count: bucket.parents ? bucket.parents.value : bucket.doc_count, active: active })
      })
    }
  })

  return filters
}
