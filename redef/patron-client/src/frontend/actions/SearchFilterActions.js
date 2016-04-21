import { push, replace } from 'react-router-redux'

export function setFilter (aggregation, bucket, active, router) {
  return (dispatch, getState) => {
    let queryParamName = `filter_${aggregation}`
    let locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    let queryParam = locationQuery[ queryParamName ]
    if (active) {
      if (queryParam && Array.isArray(queryParam)) {
        if (!queryParam.includes(bucket)) {
          queryParam.push(bucket)
        }
      } else if (queryParam && queryParam !== bucket) {
        locationQuery[ queryParamName ] = [ queryParam, bucket ]
      } else {
        locationQuery[ queryParamName ] = bucket
      }
    } else {
      if (queryParam && Array.isArray(queryParam)) {
        if (queryParam.includes(bucket)) {
          queryParam.splice(queryParam.indexOf(bucket), 1)
        }
      } else if (queryParam === bucket) {
        delete locationQuery[ queryParamName ]
      }
    }
    delete locationQuery[ 'page' ]
    let url = router.createPath({ pathname: '/search', query: locationQuery })
    return dispatch(push(url))
  }
}

export function setFiltersVisibility (aggregation, router) {
  return (dispatch, getState) => {
    let queryParamName = 'showMore'
    let locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    let queryParam = locationQuery[ queryParamName ] || []
    if (!Array.isArray(queryParam)) {
      queryParam = [ queryParam ]
    }
    if (queryParam.includes(aggregation)) {
      queryParam = queryParam.filter(showMoreFilter => showMoreFilter !== aggregation)
    } else {
      queryParam.push(aggregation)
    }
    if (queryParam.length === 0) {
      delete locationQuery [ queryParamName ]
    } else {
      locationQuery[ queryParamName ] = queryParam
    }
    let url = router.createPath({ pathname: '/search', query: locationQuery })
    return dispatch(replace(url))
  }
}

export function setAllFiltersVisibility (router) {
  return (dispatch, getState) => {
    let queryParamName = 'hideFilters'
    let locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    let queryParam = locationQuery[ queryParamName ]
    if (queryParam) {
      delete locationQuery[ queryParamName ]
    } else {
      locationQuery[ queryParamName ] = true
    }
    let url = router.createPath({ pathname: '/search', query: locationQuery })
    return dispatch(replace(url))
  }
}
