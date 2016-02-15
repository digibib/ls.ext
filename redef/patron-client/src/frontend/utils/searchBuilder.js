import Constants from '../constants/Constants'

export function filteredSearchQuery (query, filters) {
  let elasticSearchQuery = {}

  elasticSearchQuery.query = {
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
                fields: [ 'work.mainTitle.*^2', 'work.partTitle.*' ]
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

  let musts = {}

  filters.forEach(filter => {
    if (musts[ filter.aggregation ]) {
      musts[ filter.aggregation ].terms.push(filter.bucket)
    } else {
      let must = { terms: {} }
      must.terms[ filter.aggregation ] = [ filter.bucket ]
      musts[ filter.aggregation ] = must
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
      terms: {
        field: field
      }
    }

    Object.keys(musts).forEach(aggregation => {
      let must = musts[ aggregation ]
      if (aggregation !== field) {
        aggregations.filter.and.push({ bool: { must: must } })
      }
    })

    elasticSearchQuery.aggregations.all.aggregations[ field ] = aggregations
  })

  return elasticSearchQuery
}