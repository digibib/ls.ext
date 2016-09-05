import QueryString from 'query-string'

import Constants from '../constants/Constants'

export function getCategorizedFilters (query) {
  const filters = getFiltersFromQuery(query)
  var categorizedFilters = []
  filters.forEach(filter => {
    const filterType = filter.id.split('_')[ 0 ]
    if (categorizedFilters[ filterType ]) {
      categorizedFilters[ filterType ].push(filter.bucket)
    } else {
      categorizedFilters[ filterType ] = [ filter.bucket ]
    }
  })
  return categorizedFilters
}

export function getFiltersFromQuery (query) {
  var paramsToUse
  if (query.back) {
    const back = query.back
    const backQuery = back.split('?')[ 1 ]
    paramsToUse = QueryString.parse(backQuery)
  } else {
    paramsToUse = query
  }
  const filters = paramsToUse[ 'filter' ]
  return parseFilters(filters)
}

export function parseFilters (filters) {
  var parsedFilters = []
  if (filters) {
    if (!Array.isArray(filters)) {
      filters = [ filters ]
    }
    filters.forEach((filter) => {
      const filterParts = filter.split('_')
      const filterType = filterParts[ 0 ]
      const filterValue = filter.substring(filterType.length + 1)
      const parsedFilter = {
        active: true,
        bucket: Constants.filterableFields[ filterType ].prefix + filterValue,
        id: filterType + '_' + filterValue
      }
      parsedFilters.push(parsedFilter)
    })
  }
  return parsedFilters
}
