import { push, replace } from 'react-router-redux'

export function toggleParameter (queryParamName, inputLocationQuery) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = inputLocationQuery || { ...getState().routing.locationBeforeTransitions.query }
    const queryParam = locationQuery[ queryParamName ]
    if (queryParam !== undefined) {
      delete locationQuery[ queryParamName ]
    } else {
      locationQuery[ queryParamName ] = null // null enables the parameter
    }
    return dispatch(push({ pathname: pathname, query: locationQuery }))
  }
}

export function toggleParameterValue (queryParamName, value, inputLocationQuery, shouldRemoveInBackString = false, nameToReplace) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = inputLocationQuery || { ...getState().routing.locationBeforeTransitions.query }
    let queryParam = locationQuery[ queryParamName ] || []
    if (shouldRemoveInBackString) {
      locationQuery[ queryParamName ] = queryParam.replace(`${nameToReplace}=${value}&`, '')
    } else {
      if (!Array.isArray(queryParam)) {
        queryParam = [ queryParam ]
      }
      if (queryParam.includes(value)) {
        queryParam = queryParam.filter(queryParamValue => queryParamValue !== value)
      } else {
        queryParam.push(value)
      }
      if (queryParam.length === 0) {
        delete locationQuery[ queryParamName ]
      } else {
        locationQuery[ queryParamName ] = queryParam
      }
    }
    return dispatch(push({ pathname: pathname, query: locationQuery }))
  }
}

export function ensureLanguageFilterOpen (inputLocationQuery) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = inputLocationQuery || { ...getState().routing.locationBeforeTransitions.query }
    let queryParam = locationQuery[ 'showFilter' ] || []
    if (!Array.isArray(queryParam)) {
      queryParam = [ queryParam ]
    }
    if (queryParam.length > 0) {
      // There are allready toggled filters, which means this is not an "initial query",
      // but a refinement of existing query.
      return
    }
    locationQuery[ 'showFilter' ] = ['language']
    return dispatch(replace({ pathname: pathname, query: locationQuery }))
  }
}
