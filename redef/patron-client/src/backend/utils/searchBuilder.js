const QueryParser = require('querystring')
const Constants = require('../../frontend/constants/Constants')
const Defaults = require('./queryConstants')

function escape (query) {
  return query.replace(/\//g, '\\/')
}

function workAggFilter (field, workFilters, publicationFilters) {
  return {
    bool: {
      must: workFilters.filter(f => { return !f.terms[field] })
      .concat(
        publicationFilters.filter(f => { return f.range || !f.terms[field] }).map(f => {
          return {
            has_child: {
              type: 'publication',
              query: f
            }
          }
        })
      )
    }
  }
}

function pubAggFilter (field, workFilters, publicationFilters) {
  return {
    bool: {
      must: publicationFilters.filter(f => { return f.range || !f.terms[field] })
      .concat(
        workFilters.filter(f => { return !f.terms[field] }).map(f => {
          return {
            has_parent: {
              type: 'work',
              query: f
            }
          }
        })
      )
    }
  }
}

function initCommonQuery (workQuery, publicationQuery, allFilters, workFilters, publicationFilters, excludeUnavailable, page, pageSize = 20, options) {
  options = Object.assign({
    explain: false,
    ageGain: 10.0,
    ageScale: 1000.0,
    itemsGain: 0.0,
    itemsScale: 100,
    itemsCountLimit: 200,
    childBoost: 1
  }, options)

  const publicationAggregations = {}
  const workAggregations = {}
  Object.keys(Constants.filterableFields).forEach(key => {
    let field
    if (key === 'branch') {
      field = 'homeBranches'
      if (excludeUnavailable) {
        field = 'availableBranches'
      }
    } else {
      field = Constants.filterableFields[ key ].name
    }
    if (field === 'fictionNonfiction' || field === 'audiences') {
      // aggregations on work properties
      workAggregations[ field ] = {
        aggs: {
          [ field ]: {
            terms: {
              field: field,
              size: 1000
            }
          }
        },
        filter: workAggFilter(field, workFilters, publicationFilters)
      }
    } else {
      // aggregations on publication properties
      publicationAggregations[ field ] = {
        aggs: {
          [ field ]: {
            terms: {
              field: field,
              size: 1000
            },
            aggs: {
              parents: {
                cardinality: {
                  field: '_parent'
                }
              }
            }
          }
        },
        filter: pubAggFilter(field, workFilters, publicationFilters)
      }
    }
  })

  function publicationBoost (query) {
    return {
      function_score: {
        boost: options.childBoost, // general child boost
        boost_mode: 'multiply',
        query: query,
        script_score: {
          script: {
            inline: `
                      def score = _score;

                      def mtScores = [
                        "Film": 0.3,
                        "Språkkurs": 0.2
                      ];
                      
                      if (doc['_type'] === 'publication') {
                        def mtScore = mtScores.get(doc.mt.value);
                        if (mtScore !== null) {
                          score = score * mtScore;
                        }
                      }
                      
                      def langscores = [
                        "nob": 1.5,
                        "nno": 1.5,
                        "nor": 1.5,
                        "eng": 1.4,
                        "swe": 1.3,
                        "dan": 1.3,
                        "ger": 1.2,
                        "fre": 1.2,
                        "spa": 1.1,
                        "ita": 1.1
                      ];
                      
                      def langscore = langscores.get(doc.language.value);
                      if (langscore == null) {
                        langscore = 1;
                      }

                      if (doc['_type'] === 'publication' && doc.mt === 'Bok') {
                        score = _score * langscore;
                      }
                      
                      return score;`.replace('\n', ''),
            lang: 'painless'
          }
        }
      }
    }
  }

  function workBoost (query) {
    return {
      function_score: {
        boost: options.childBoost, // general child boost
        boost_mode: 'multiply',
        query: query,
        script_score: {
          script: {
            inline: `
                      def score = _score;

                      def items_gain=params.itemsGain;
                      def items_scale=params.itemsScale;
                      if (doc.totalNumItems.value != null) {
                        score *= (1 + (items_gain*(Math.min(doc.totalNumItems.value, params.itemsCountLimit)/items_scale)));
                      }

                      def age_gain=params.ageGain;
                      def age_scale=params.ageScale;
                      if (!doc['created'].empty) {
                        score *= (1.0 + age_gain * Math.min(1 - ((params.now - doc.created.date.getMillis())/86400000)/age_scale, 1.0));
                      } else if (!doc['publicationYear'].empty) {
                        score *= (1.0 + age_gain * (1.0 - Math.min((params.now - (doc.publicationYear.value - 1970) * 31536000*1000)/86400000, age_scale)/age_scale))
                      }

                      return score;`.replace('\n', ''),
            lang: 'painless',
            params: {
              now: Date.now() - options.timeTravel ? Number(options.timeTravel) * 86400000 : 0,
              itemsGain: Number(options.itemsGain),
              itemsScale: Number(options.itemsScale),
              itemsCountLimit: Number(options.itemsCountLimit),
              ageGain: Number(options.ageGain),
              ageScale: Number(options.ageScale)
            }
          }
        }
      }
    }
  }

  const boostableQuery = {
    bool: {
      must: [
        publicationQuery
      ]
    }
  }
  return {
    size: pageSize,
    from: pageSize * (page - 1 || 0),
    aggs: {
      facets: {
        global: {},
        aggs: {
          facets: {
            filter: {
              bool: {
                minimum_should_match: 1,
                should: [
                  allFilters[0],
                  {
                    has_child: {
                      type: 'publication',
                      query: allFilters[0]
                    }
                  }
                ]
              }
            },
            aggs: Object.assign(
              workAggregations,
              {
                publication_facets: {
                  children: {
                    type: 'publication'
                  },
                  aggs: publicationAggregations
                }
              }
            )
          }
        }
      }
    },
    query: {
      bool: {
        must: {
          dis_max: {
            queries: [
              {
                // query work by publication properties
                has_child: {
                  score_mode: 'max',
                  type: 'publication',
                  query: !options.skipScript ? publicationBoost(boostableQuery) : boostableQuery,
                  inner_hits: {
                    size: 100,
                    name: 'publications',
                    explain: options.explain === 'true'
                  }
                }
              },
              {
                // query by work properties
                bool: {
                  must: {
                    has_child: {
                      type: 'publication',
                      query: {
                        match_all: {}
                      },
                      inner_hits: {
                        size: 100,
                        name: 'publications'
                      }
                    }
                  },
                  should: [
                    workQuery,
                    workBoost(workQuery)
                  ]
                }
              }
            ]
          }
        },
        filter: [
          {
            bool: {
              minimum_should_match: 1,
              should: [
                allFilters[0],
                {
                  has_child: {
                    type: 'publication',
                    query: allFilters[0]
                  }
                }
              ],
              must: workFilters.concat(
                publicationFilters.concat(
                  excludeUnavailable
                  ? [{
                    exists: {
                      field: 'availableBranches'
                    }
                  }]
                  : []
                ).map(filter => {
                  return {
                    has_child: {
                      type: 'publication',
                      query: filter
                    }
                  }
                })
              )
            }
          }
        ]
      }
    },
    explain: options.explain === 'true'
  }
}

function simpleQuery (query, fields, options) {
  options = options || {}
  const terms = query.split(/\s+/)
  let phrases = [query]
  for (let i = 0; i < terms.length; i++) {
    const firstPart = terms.slice(0, i + 1)
    if (firstPart.length > 1) {
      phrases.push(firstPart.join(' '))
    }
    const secondPart = terms.slice(i)
    if (secondPart.length > 1) {
      phrases.push(secondPart.join(' '))
    }
  }

  phrases = [ ...new Set(phrases) ]

  const fieldsAndPhrases = []
  fields.forEach(field => {
    if (field.phrase && !options.noPhrasePerm || field.tokenize) {
      phrases.forEach(phrase => {
        fieldsAndPhrases.push({
          field, query: phrase, boost: (field.boost || 1)
        })
      })
    } else {
      fieldsAndPhrases.push({
        field, query, boost: field.boost
      })
    }
  })

  return {
    dis_max: {
      queries: fieldsAndPhrases.map(field => {
        return {
          constant_score: {
            filter: field.field.phrase ? {
              match_phrase: {
                [field.field.field]: {
                  query: field.query,
                  slop: 3
                }
              }
            } : {
              match: {
                [field.field.field]: {
                  query: field.query,
                  minimum_should_match: field.minimumMatch || '70%'
                }
              }
            },
            boost: field.boost || 1
          }
        }
      })
    }
  }
}

function initAdvancedQuery (query) {
  return {
    query_string: {
      query: translateFieldTerms(query, Constants.queryFieldTranslations),
      default_operator: 'and'
    }
  }
}

function translateFieldTerms (query, translations) {
  const chars = [ ...query ]
  let result = ''
  let inQuote = false
  let startField = 0
  let startValue = 0
  for (let i = 0; i < chars.length; i++) {
    const c = chars[ i ]
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
      if (translations[ field ]) {
        field = translations[ field ]
        if (field instanceof Object) {
          field = field.translation
        }
      }
      result += field
      result += ':'
      startValue = i + 1
    }
  }
  return result += chars.slice(startValue, chars.length).join('')
}

// parse query string to decide what kind of query we think this is
function queryStringToQuery (queryString, workFilters, publicationFilters, excludeUnavailable, page, pageSize, options) {
  const escapedQueryString = escape(queryString)
  const isbn10 = new RegExp('^[0-9Xx-]{10,13}$')
  const isbn13 = new RegExp('^[0-9-]{13,17}$')
  const advTriggers = new RegExp('[:+/\\-()*^]|AND|OR|NOT|TO')

  if (isbn10.test(escapedQueryString) || isbn13.test(escapedQueryString)) {
    return initCommonQuery({}, initAdvancedQuery(`isbn:${escapedQueryString}`), [initAdvancedQuery(`isbn:${escapedQueryString}`)], workFilters, publicationFilters, excludeUnavailable, page, pageSize, options)
  } else if (advTriggers.test(escapedQueryString)) {
    return initCommonQuery(initAdvancedQuery(escapedQueryString), initAdvancedQuery(escapedQueryString), [initAdvancedQuery(escapedQueryString)], workFilters, publicationFilters, excludeUnavailable, page, pageSize, options)
  } else {
    const _allFilter = options.noAllFilter ? [] : [ {
      match: {
        _all: {
          query: options.query,
          operator: 'and'
        }
      }
    } ]
    return initCommonQuery(
      simpleQuery(escapedQueryString, Defaults.defaultWorkFields, options),
      simpleQuery(escapedQueryString, Defaults.defaultPublicationFields, options),
      _allFilter,
      workFilters,
      publicationFilters,
      excludeUnavailable, page, pageSize, options)
  }
}

function parseFilters (filtersFromLocationQuery, domain, excludeUnavailable) {
  const filterableFields = Constants.filterableFields
  const terms = {}
  if (!Array.isArray(filtersFromLocationQuery)) {
    filtersFromLocationQuery = [ filtersFromLocationQuery ]
  }
  filtersFromLocationQuery.forEach(filterParamValue => { // ex filterParamValue: 'audience_juvenile'
    const split = filterParamValue.split('_')
    const filterableField = filterableFields[ split[ 0 ] ]
    if (filterableField.domain === domain) {
      let aggregation = filterableField.name
      if (aggregation === 'branches') {
        aggregation = 'homeBranches'
        if (excludeUnavailable) {
          aggregation = 'availableBranches'
        }
      }
      if (!terms[ aggregation ]) {
        terms[ aggregation ] = []
      }
      const val = filterableField.prefix + filterParamValue.substring(`${split[ 0 ]}_`.length)
      terms[ aggregation ].push(val)
    }
  })

  const filters = []
  Object.keys(terms).forEach(aggregation => {
    filters.push({ terms: { [aggregation]: terms[ aggregation ] } })
  })

  return filters
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

function createPublicationFilters (params, excludeUnavailable) {
  const publicationFilters = parseFilters(params.filter || [], 'publication', excludeUnavailable)

  let yearRange
  if (params.yearFrom || params.yearTo) {
    yearRange = yearRangeFilter(params.yearFrom, params.yearTo)
  }
  if (yearRange) {
    publicationFilters.push(yearRange)
  }

  return publicationFilters
}

module.exports.buildQuery = function (urlQueryString) {
  const params = QueryParser.parse(urlQueryString)
  const excludeUnavailable = Object.hasOwnProperty.call(params, 'excludeUnavailable')
  const workFilters = parseFilters(params.filter || [], 'work')
  const publicationFilters = createPublicationFilters(params, excludeUnavailable)
  const query = queryStringToQuery(params.query, workFilters, publicationFilters, excludeUnavailable, params.page, params.pageSize, params)
//  console.log(JSON.stringify(query, null, 2))
  return query
}

module.exports.buildUnfilteredAggregatedQuery = function (urlQueryString) {
  const params = QueryParser.parse(urlQueryString)
  return queryStringToQuery('*', [], [], false, 0, 0, params)
}

// function exported only to be testable. TODO is there another way?
module.exports.translateFieldTerms = translateFieldTerms

