const QueryParser = require('querystring')
const Constants = require('../../frontend/constants/Constants')
const Defaults = require('./queryConstants')

function escape (query) {
  return query.replace(/\//g, '\\/')
}

function simpleQuery (query) {
  return {
    bool: {
      must: [
        {
          simple_query_string: {
            query: query,
            default_operator: 'and',
            fields: Defaults.defaultFields
          }
        }
      ]
    }
  }
}

function advancedQuery (query) {
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

function fieldQuery (fields, queryString) {
  const q = fields.map(field => { return `${field}:${queryString}` }).join(' ')
  return {
    bool: {
      must: [
        {
          query_string: {
            query: q,
            default_operator: 'or'
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

// parse query string to decide what kind of query we think this is
function queryStringToQuery (queryString) {
  const escapedQueryString = escape(queryString)
  const isbn10 = new RegExp('^[0-9Xx-]{10,13}$')
  const isbn13 = new RegExp('^[0-9-]{13,17}$')
  const advTriggers = new RegExp('[:+/-^()"*]|AND|OR|NOT|TO')

  if (isbn10.test(escapedQueryString) || isbn13.test(escapedQueryString)) {
    return fieldQuery(['isbn'], escapedQueryString)
  } else if (advTriggers.test(escapedQueryString)) {
    return advancedQuery(escapedQueryString)
  } else {
    return simpleQuery(escapedQueryString)
  }
}

function parseFilters (excludeUnavailable, filtersFromLocationQuery) {
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

function yearRangeFilter (yearFrom, yearTo) {
  const start = yearFrom || 0
  const end = yearTo || new Date().getFullYear()
  return {
    range: {
      publicationYear: {
        gte: parseInt(start),
        lte: parseInt(end)
      }
    }
  }
}

module.exports.buildQuery = function (urlQueryString) {
  const params = QueryParser.parse(urlQueryString)
  const elasticSearchQuery = Defaults.queryDefaults
  elasticSearchQuery.aggs = Defaults.defaultAggregates
  elasticSearchQuery.query = queryStringToQuery(params.query)
  const excludeUnavailable = Object.hasOwnProperty.call(params, 'excludeUnavailable')
  const filters = parseFilters(excludeUnavailable, params.filter || [])
  const musts = {}
  filters.forEach(filter => {
    let aggregation = filter.aggregation
    if (aggregation === 'branches') {
      aggregation = 'homeBranches'
      if (excludeUnavailable) {
        aggregation = 'availableBranches'
      }
    }
    const must = createMust(aggregation, filter.bucket)
    musts[ aggregation ] = must
  })

  Object.keys(musts).forEach(aggregation => {
    elasticSearchQuery.query.bool.must.push(musts[ aggregation ])
  })

  let yearRange
  if (params.yearFrom || params.yearTo) {
    yearRange = yearRangeFilter(params.yearFrom, params.yearTo)
  }

  if (yearRange) {
    elasticSearchQuery.query.bool.must.push(yearRange)
  }

  if (excludeUnavailable) {
    elasticSearchQuery.query.bool.must.push({
      exists: {
        field: 'availableBranches'
      }
    })
  }

  Object.keys(Constants.filterableFields).forEach(key => {
    let field
    let fieldName
    if (key === 'branch') {
      fieldName = 'branches'
      field = 'homeBranches'
      if (excludeUnavailable) {
        field = 'availableBranches'
      }
    } else {
      field = Constants.filterableFields[ key ].name
      fieldName = field
    }
    elasticSearchQuery.aggs.facets.aggs[ fieldName ] = {
      filter: {
        bool: Object.assign({}, elasticSearchQuery.query.bool)
      },
      aggs: {
        [fieldName]: {
          terms: {
            field: field,
            size: 1000
          }
        }
      }
    }

    const aggregationMusts = [elasticSearchQuery.query.bool.must[0]]
    if (yearRange) {
      aggregationMusts.push(yearRange)
    }
    if (excludeUnavailable) {
      aggregationMusts.push({
        exists: {
          field: 'availableBranches'
        }
      })
    }
    Object.keys(musts).forEach(aggregation => {
      const must = musts[ aggregation ]
      if (fieldName === 'branches') {
        if (aggregation === 'homeBranches' || aggregation === 'availableBranches') {
          return
        }
      }
      if (aggregation !== fieldName) {
        aggregationMusts.push(must)
      }
    })
    elasticSearchQuery.aggs.facets.aggs[ fieldName ].filter.bool.must = aggregationMusts
  })
  if (process.env.NODE_ENV === 'development') {
    console.log(`Parsed searchBuilder query: ${JSON.stringify(elasticSearchQuery)}`)
  }
  return elasticSearchQuery
}

// function exported only to be testable. TODO is there another way?
module.exports.translateFieldTerms = translateFieldTerms
