const QueryParser = require('querystring')
const Constants = require('../../frontend/constants/Constants')
const Defaults = require('./queryConstants')
const LuceneParser = require('lucene-query-parser')

function escape (query) {
  return query.replace(/\//g, '\\/')
}

function workAggFilter (field, workFilters, publicationFilters) {
  return {
    bool: {
      must: workFilters.filter(f => { return !f.terms[ field ] })
        .concat(
          publicationFilters.filter(f => { return f.range || !f.terms[ field ] }).map(f => {
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
      must: publicationFilters.filter(f => { return f.range || !f.terms[ field ] })
        .concat(
          workFilters.filter(f => { return !f.terms[ field ] }).map(f => {
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
    ageGain: 6.0,
    ageScale: 30000.0,
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
        boost_mode: 'replace',
        score_mode: 'max',
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
                        "sma": 1.5,
                        "smn": 1.5,
                        "sjk": 1.5,
                        "sjd": 1.5,
                        "sje": 1.5,
                        "smi": 1.5,
                        "sms": 1.5,
                        "sjt": 1.5,
                        "sju": 1.5,
                        "smj": 1.5,
                        "sme": 1.5,
                        "sia": 1.5,                        
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
        boost_mode: 'replace',
        query: query,
        script_score: {
          script: {
            inline: `
                      def score = _score;

                      def age_gain=params.ageGain;
                      def age_scale=params.ageScale;
                      if (!doc['created'].empty) {
                        score *= (1.0 + age_gain * (1.0 - Math.min((params.now - (doc.created.date.getMillis()    ) * 1            )/86400000, age_scale)/age_scale));
                      } else if (!doc['publicationYear'].empty) {
                        score *= (1.0 + age_gain * (1.0 - Math.min((params.now - (doc.publicationYear.value - 1970) * 31536000*1000)/86400000, age_scale)/age_scale))
                      }

                      return score;`.replace('\n', ''),
            lang: 'painless',
            params: {
              now: Date.now() - (options.timeTravel ? Number(options.timeTravel) * 86400000 : 0),
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
                  allFilters[ 0 ],
                  {
                    has_child: {
                      type: 'publication',
                      query: allFilters[ 1 ]
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
                  query: {
                    bool: {
                      must: [ !options.skipScript ? publicationBoost(boostableQuery) : boostableQuery ],
                      filter: [].concat(options.scopedPublicationFilter || [])
                    }
                  },
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
                      score_mode: 'max',
                      query: {
                        bool: {
                          must: [ { match_all: {} } ],
                          filter: [].concat(options.scopedPublicationFilter || [])
                        }
                      },
                      inner_hits: {
                        size: 100,
                        name: 'publications'
                      }
                    }
                  },
                  should: [
                    workBoost(workQuery)
                  ],
                  must_not: options.exclusionFilter ? {
                    has_child: {
                      type: 'publication',
                      query: options.exclusionFilter
                    }
                  } : []
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
                allFilters[ 0 ] || {
                  match_all: {}
                },
                {
                  has_child: {
                    type: 'publication',
                    query: allFilters[ 1 ] || allFilters[ 0 ]
                  }
                }
              ],
              must_not: options.exclusionFilter ? {
                has_child: {
                  type: 'publication',
                  query: options.exclusionFilter
                }
              } : [],
              must: workFilters.concat([ {
                has_child: {
                  type: 'publication',
                  query: {
                    bool: {
                      must:
                        publicationFilters.concat(
                          excludeUnavailable
                            ? [ {
                              exists: {
                                field: 'availableBranches'
                              }
                            } ]
                            : []
                        ).concat(options.scopedPublicationFilter || [])
                    }
                  }
                }
              } ]).concat(options.scopedWorkFilter || [])
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
  let phrases = [ query ]
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
                  slop: 0
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

function initAdvancedQuery (query, scope, skipUnscoped, invert) {
  const translatedQuery = translateFieldTerms(query, Constants.queryFieldTranslations, scope, skipUnscoped, invert)
  if (translatedQuery === '' && invert) {
    return undefined
  } else {
    return {
      query_string: {
        query: translatedQuery.replace(/^$/, '*'),
        default_operator: 'and',
        lenient: true
      }
    }
  }
}

function translateFieldTerms (query, translations, scope, skipUnscoped, returnExclusionOnly) {
  function serialize (node) {
    let result = ''
    if (typeof node !== 'object') {
      return result
    }
    let leafed = false

    function interval () {
      return `${node.inclusive ? '[' : '{'}${node.term_min} TO ${node.term_max}${node.inclusive ? ']' : '}'}`
    }

    function quotedTerm () {
      const needsQuotes = node.term.indexOf(' ') !== -1 || node.term.indexOf('-') !== -1
      return node.term === '*' ? node.term : `${needsQuotes ? '"' : ''}${node.term}${needsQuotes ? '"' : ''}${node.boost ? `^${node.boost}` : ''}`
    }

    function field () {
      return node.field !== '<implicit>' ? `${node.field}:` : ''
    }

    let leftParens = node.operator === 'OR' ? '(' : ''
    if (node.field && node.left && node.right) {
      result += `${field()}(`
      leftParens = ''
    }
    if (node.left) {
      result += `${leftParens}${serialize(node.left)}`
    } else {
      result += `${field()}${node.prefix || ''}${node.term_min ? interval() : quotedTerm()}${node.proximity ? `~${node.proximity}` : ''}`
      leafed = true
    }
    if (node.operator) {
      result += ` ${node.operator} `
    }
    let rightParens = node.operator === 'OR' ? ')' : ''
    if (node.right) {
      result += `${serialize(node.right)}${rightParens}`
      rightParens = ''
    } else if (!leafed && node.field) {
      result += `${field()}${node.prefix || ''}${node.term_min ? interval() : quotedTerm()}`
    }
    if (node.field && node.left && node.right) {
      result += rightParens
    }
    return result
  }

  function transform (node) {
    const result = {}
    if (node.field) {
      let field = node.field
      const prefixedScope = (field.match(/^([a-zA-Z]+)\./) || [])[ 1 ]
      field = field.replace(/^[a-zA-Z]+\./, '')
      let translationSpec = translations[ field ]
      if (typeof translationSpec === 'string' && translationSpec.startsWith('=')) {
        translationSpec = translations[ translationSpec.substr(1) ]
      }
      if (translationSpec) {
        if (translationSpec.translation) {
          if (scope && translationSpec.scope && ((prefixedScope || translationSpec.scope) !== scope)) {
            return undefined
          }
          field = translationSpec.translation
        } else {
          field = translationSpec
        }
      }
      if (skipUnscoped) {
        if (translationSpec && !translationSpec.scope && !prefixedScope) {
          return undefined
        }
        if (!translationSpec && !prefixedScope) {
          return undefined
        }
      }
      if (prefixedScope && prefixedScope !== scope) {
        return undefined
      }
      return Object.assign(node, { field })
    }
    if (node.left) {
      result.left = transform(node.left)
      if (!result.left) {
        delete result.left
        if (node.operator === 'NOT') {
          result.left = {
            field: '*',
            term: '*'
          }
        } else {
          delete node.operator
        }
      }
    }
    if (node.right) {
      result.right = transform(node.right)
      if (!result.right) {
        delete result.right
        delete node.operator
      }
    }
    if (!result.left && !result.right) {
      return undefined
    }
    if (!result.left) {
      return result.right
    }
    if (!result.right) {
      return result.left
    }
    if (node.operator && result.left && result.right) {
      result.operator = node.operator.replace('<implicit>', 'AND')
    }
    return result
  }

  let parsed = LuceneParser.parse(query)
  parsed = transform(parsed)
  if (returnExclusionOnly) {
    while (parsed && parsed.operator !== 'NOT') {
      parsed = parsed.right
    }
    if (parsed && parsed.operator === 'NOT') {
      parsed = parsed.right
    }
  }
  return serialize(parsed)
}

// parse query string to decide what kind of query we think this is
function queryStringToQuery (queryString, workFilters, publicationFilters, excludeUnavailable, page, pageSize, options) {
  const escapedQueryString = escape(queryString)
  const isbn10 = /^[0-9Xx-]{10,13}$/
  const isbn13 = /^[0-9-]{13,17}$/
  const advTriggers = /[:+\/\-()*^?]|AND|OR|NOT|TO/

  if (isbn10.test(escapedQueryString) || isbn13.test(escapedQueryString)) {
    return initCommonQuery({},
      initAdvancedQuery(`isbn:"${escapedQueryString}"`, 'Publication'),
      [ initAdvancedQuery(`isbn:"${escapedQueryString}"`, 'Publication') ],
      workFilters,
      publicationFilters,
      excludeUnavailable,
      page, pageSize, options)
  } else if (advTriggers.test(escapedQueryString)) {
    const workQuery = initAdvancedQuery(escapedQueryString, 'Work')
    const publicationQuery = initAdvancedQuery(escapedQueryString, 'Publication')
    return initCommonQuery(workQuery,
      publicationQuery,
      [ workQuery, publicationQuery ],
      workFilters,
      publicationFilters,
      excludeUnavailable,
      page, pageSize, Object.assign(options, {
        scopedWorkFilter: [ initAdvancedQuery(escapedQueryString, 'Work', true) ],
        scopedPublicationFilter: [ initAdvancedQuery(escapedQueryString, 'Publication', true) ],
        exclusionFilter: initAdvancedQuery(escapedQueryString, 'Publication', false, true)
      }))
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
//  console.log('**********************')
//  console.log(JSON.stringify(query, null, 2))
  return query
}

module.exports.buildUnfilteredAggregatedQuery = function (urlQueryString) {
  const params = QueryParser.parse(urlQueryString)
  return queryStringToQuery('*', [], [], false, 0, 0, params)
}

// function exported only to be testable. TODO is there another way?
module.exports.translateFieldTerms = translateFieldTerms

