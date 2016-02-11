const filterableFields = [ 'work.formats' ]

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

  elasticSearchQuery.size = 10
  elasticSearchQuery.aggregations = {}
  filterableFields.forEach(field => {
    elasticSearchQuery.aggregations[ field ] = {
      terms: {
        field: field
      }
    }
  })

  return elasticSearchQuery
}

export function aggregationQuery (query) {
  let elasticSearchQuery = {}
  elasticSearchQuery.query = {
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

  elasticSearchQuery.size = 0
  elasticSearchQuery.aggregations = {}
  filterableFields.forEach(field => {
    elasticSearchQuery.aggregations[ field ] = {
      terms: {
        field: field
      }
    }
  })

  return elasticSearchQuery
}
