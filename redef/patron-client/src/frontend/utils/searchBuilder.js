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

  Object.keys(musts).forEach(key => {
    elasticSearchQuery.query.filtered.filter.bool.must.push(musts[ key ])
  })

  let groupedFilters = {}
  filters.forEach(filter => {
    groupedFilters[ filter.aggregation ] = groupedFilters[ filter.aggregation ] || []
    groupedFilters[ filter.aggregation ].push(filter.bucket)
  })

  elasticSearchQuery.size = 10
  elasticSearchQuery.aggregations = {}
  elasticSearchQuery.aggregations.all = { global: {}, aggregations: {} }

  /*
   let filterableFieldMusts = {}

   filterableFields.forEach(field => {
   filterableFieldMust = {terms: {}}

   filterableFieldMusts[field] = filterableFieldMust
   })
   */

  Constants.filterableFields.forEach(field => {
    elasticSearchQuery.aggregations.all.aggregations[ field ] = {
      filter: {
        and: [ elasticSearchQuery.query.filtered.query ]
      },
      aggregations: {}
    }

    elasticSearchQuery.aggregations.all.aggregations[ field ].aggregations[ field ] = {
      terms: {
        field: field
      }
    }

    Object.keys(musts).forEach(aggregation => {
      let must = musts[ aggregation ]
      if (aggregation !== field) {
        elasticSearchQuery.aggregations.all.aggregations[ field ].filter.and.push({ bool: { must: must } })
      }
    })
  })

  return elasticSearchQuery
}