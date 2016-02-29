import Constants from '../constants/Constants'

export function filteredSearchQuery (query, filters) {
  let elasticSearchQuery = initQuery(query)
  let musts = {}
  let nestedMusts = {}

  filters.forEach(filter => {
    let path = getPath(filter.aggregation)
    if (musts[ path ]) {
      if (nestedMusts[ filter.aggregation ]) {
        nestedMusts[ filter.aggregation ].terms[ filter.aggregation ].push(filter.bucket)
      } else {
        let nestedMust = { terms: {} }
        nestedMust.terms[ filter.aggregation ] = [ filter.bucket ]
        musts[ path ].nested.query.bool.must.push(nestedMust)
        nestedMusts [ filter.aggregation ] = nestedMust
      }
    } else {
      let must = createMust(path)

      must.nested.query.bool.must[ 0 ].terms[ filter.aggregation ] = [ filter.bucket ]
      nestedMusts[ filter.aggregation ] = must.nested.query.bool.must[ 0 ]
      musts[ path ] = must
    }
  })

  Object.keys(musts).forEach(aggregation => {
    elasticSearchQuery.query.filtered.filter.bool.must.push(musts[ aggregation ])
  })

  elasticSearchQuery.size = Constants.searchQuerySize
  elasticSearchQuery.aggregations = { all: { global: {}, aggregations: {} } }

  Constants.filterableFields.forEach(field => {
    let aggregations = {
      filter: {
        and: [ elasticSearchQuery.query.filtered.query ]
      },
      aggregations: {}
    }

    aggregations.aggregations[ field ] = {
      nested: {
        path: getPath(field)
      },
      aggregations: {}
    }

    aggregations.aggregations[ field ].aggregations[ field ] = {
      terms: {
        field: field
      }
    }

    Object.keys(musts).forEach(path => {
      let must = createMust(path)
      let nestedMusts = musts[ path ].nested.query.bool.must
      must.nested.query.bool.must = nestedMusts.filter(nestedMust => { return !nestedMust.terms[ field ] })
      aggregations.filter.and.push({ bool: { must: must } })
    })

    elasticSearchQuery.aggregations.all.aggregations[ field ] = aggregations
  })

  return elasticSearchQuery
}

function getPath (field) {
  return field.split('.').slice(0, -1).join('.')
}

function initQuery (query) {
  return {
    query: {
      filtered: {
        filter: {
          bool: {
            must: []
          }
        },
        query: {
          bool: {
            should: [
              {
                multi_match: {
                  query: query,
                  fields: [ 'work.mainTitle^2', 'work.partTitle' ]
                }
              },
              {
                nested: {
                  path: 'work.creator',
                  query: {
                    multi_match: {
                      query: query,
                      fields: [ 'work.creator.name^2' ]
                    }
                  }
                }
              }
            ]
          }
        }
      }
    }
  }
}

function createMust (path) {
  return {
    nested: {
      path: path,
      query: {
        bool: {
          must: [
            {
              terms: {}
            }
          ]
        }
      }
    }
  }
}
