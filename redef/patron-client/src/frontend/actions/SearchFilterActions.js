import { push } from 'react-router-redux'

export function setFilter (filter, router) {
  return (dispatch, getState) => {
    let queryParamName = 'filter_' + filter.aggregation
    let locationQuery = Object.assign({}, getState().routing.locationBeforeTransitions.query)
    let queryParam = locationQuery[ queryParamName ]
    if (filter.active) {
      if (queryParam && Array.isArray(queryParam)) {
        if (queryParam.indexOf(filter.bucket) === -1) {
          queryParam.push(filter.bucket)
        }
      } else if (queryParam && queryParam !== filter.bucket) {
        locationQuery[ queryParamName ] = [ queryParam, filter.bucket ]
      } else {
        locationQuery[ queryParamName ] = filter.bucket
      }
    } else {
      if (queryParam && Array.isArray(queryParam)) {
        if (queryParam.indexOf(filter.bucket) >= 0) {
          queryParam.splice(queryParam.indexOf(filter.bucket), 1)
        }
      } else if (queryParam === filter.bucket) {
        delete locationQuery[ queryParamName ]
      }
    }
    delete locationQuery[ 'page' ]
    let url = router.createPath({ pathname: '/search', query: locationQuery })
    return dispatch(push(url))
  }
}
