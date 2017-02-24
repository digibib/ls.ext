const querystring = require('querystring')
const Constants = require('../../frontend/constants/Constants')

function initCommonQuery () {
  return {
    size: 0,
    aggs: {
      facets: {
        global: {},
        aggs: {}
      },
      byWork: {
        terms: {
          field: 'workUri',
          order: { top: 'desc' },
          size: Constants.maxSearchResults
        },
        aggs: {
          publications: {
            top_hits: {
              size: 1
            }
          },
          top: {
            max: {
              script: {
                lang: 'expression',
                inline: '_score'
              }
            }
          }
        }
      },
      workCount: {
        cardinality: {
          field: 'workUri'
        }
      }
    }
  }
}

function initSimpleQuery (query) {
  const defaultFields = [
    'agents',
    'author^50',
    'bio',
    'compType',
    'country',
    'desc',
    'ean',
    'format',
    'genre',
    'inst',
    'isbn',
    'ismn',
    'language',
    'litform',
    'mainTitle^30',
    'mt',
    'partNumber',
    'partTitle',
    // 'publicationYear',
    'publishedBy',
    'recordId',
    'series^10',
    'subject^10',
    'summary',
    'title^20',
    'workMainTitle',
    'workPartNumber',
    'workPartTitle',
    'workSubtitle'
  ]
  return {
    bool: {
      must: [
        {
          simple_query_string: {
            query: query,
            default_operator: 'and',
            fields: defaultFields
          }
        }
      ]
    }
  }
}

function initAdvancedQuery (query) {
  return {
    bool: {
      must: [
        {
          query_string: {
            query: translateFieldTerms(query, Constants.queryFieldTranslations),
            default_operator: 'and'
          }
        }
      ]
    }
  }
}

function translateFieldTerms (query, translations) {
  const chars = [...query]
  let result = ''
  let inQuote = false
  let startField = 0
  let startValue = 0
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]
    if (c === ' ') {
      if (i + 1 === chars.length) {
        break
      }
      startField = i + 1
    }
    if (c === '"') {
      inQuote = !inQuote
    }
    if (!inQuote && c === ':') {
      result += chars.slice(startValue, startField).join('')
      let field = chars.slice(startField, i).join('')
      if (translations[field]) {
        field = translations[field]
      }
      result += field
      result += ':'
      startValue = i + 1
    }
  }
  return result += chars.slice(startValue, chars.length).join('')
}

function isAdvancedQuery (queryString) {
  return /[:+-^()"*]/.test(queryString)
}

function simpleSearchBuilder (queryString) {
  const query = initCommonQuery()
  query.query = initSimpleQuery(queryString)
  return query
}

function advancedSearchBuilder (queryString) {
  const query = initCommonQuery()
  query.query = initAdvancedQuery(queryString)
  return query
}

function parseFilters (filtersFromLocationQuery) {
  const filterableFields = Constants.filterableFields
  const filterBuckets = {}
  if (!Array.isArray(filtersFromLocationQuery)) {
    filtersFromLocationQuery = [ filtersFromLocationQuery ]
  }
  filtersFromLocationQuery.forEach(filter => { // ex filter: 'audience_juvenile'
    const split = filter.split('_')
    const filterableField = filterableFields[ split[ 0 ] ]
    const aggregation = filterableField.name
    if (!filterBuckets[ aggregation ]) {
      filterBuckets[ aggregation ] = []
    }
    const val = filterableField.prefix + filter.substring(`${split[ 0 ]}_`.length)
    filterBuckets[ aggregation ].push(val)
  })

  const filters = []
  Object.keys(filterBuckets).forEach(aggregation => {
    filters.push({ aggregation: aggregation, bucket: filterBuckets[ aggregation ] })
  })

  return filters
}

function createMust (field, terms) {
  return {
    terms: {
      [field]: terms
    }
  }
}

module.exports.buildQuery = function (urlQueryString) {
  const params = querystring.parse(urlQueryString)
  const queryString = params.query
  let elasticSearchQuery = {}
  if (isAdvancedQuery(queryString)) {
    elasticSearchQuery = advancedSearchBuilder(queryString)
  } else {
    elasticSearchQuery = simpleSearchBuilder(queryString)
  }
  const filters = parseFilters(params.filter || [])
  const musts = {}
  filters.forEach(filter => {
    const aggregation = filter.aggregation
    const must = createMust(aggregation, filter.bucket)
    musts[ aggregation ] = must
  })

  Object.keys(musts).forEach(aggregation => {
    elasticSearchQuery.query.bool.must.push(musts[ aggregation ])
  })

  let yearRangeFilter
  if (params.yearFrom || params.yearTo) {
    const from = params.yearFrom || 0
    const to = params.yearTo || new Date().getFullYear()
    yearRangeFilter = {
      range: {
        publicationYear: {
          gte: parseInt(from),
          lte: parseInt(to)
        }
      }
    }
  }
  if (yearRangeFilter) {
    elasticSearchQuery.query.bool.must.push(yearRangeFilter)
  }

  Object.keys(Constants.filterableFields).forEach(key => {
    const field = Constants.filterableFields[ key ]
    const fieldName = field.name
    elasticSearchQuery.aggs.facets.aggs[ fieldName ] = {
      filter: {
        bool: Object.assign({}, elasticSearchQuery.query.bool)
      },
      aggs: {
        [fieldName]: {
          terms: {
            field: fieldName,
            size: 1000
          }
        }
      }
    }

    const aggregationMusts = [elasticSearchQuery.query.bool.must[0]]
    if (yearRangeFilter) {
      aggregationMusts.push(yearRangeFilter)
    }
    Object.keys(musts).forEach(aggregation => {
      const must = musts[ aggregation ]
      if (aggregation !== fieldName) {
        aggregationMusts.push(must)
      }
    })
    elasticSearchQuery.aggs.facets.aggs[ fieldName ].filter.bool.must = aggregationMusts
  })

  return elasticSearchQuery
}

// function exported only to be testable. TODO is there another way?
module.exports.translateFieldTerms = translateFieldTerms
