import { replace } from 'react-router-redux'

export function toggleParameter (queryParamName, locationQuery) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = locationQuery || { ...getState().routing.locationBeforeTransitions.query }
    const queryParam = locationQuery[ queryParamName ]
    if (queryParam !== undefined) {
      delete locationQuery[ queryParamName ]
    } else {
      locationQuery[ queryParamName ] = null // null enables the parameter
    }
    return dispatch(replace({ pathname: pathname, query: locationQuery }))
  }
}

export function toggleParameterValue (queryParamName, value, locationQuery, shouldRemoveInBackString = false, nameToReplace) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = locationQuery || { ...getState().routing.locationBeforeTransitions.query }
    let queryParam = locationQuery[ queryParamName ] || []
    if (shouldRemoveInBackString) {
      var newParamString = queryParam.replace(nameToReplace + '=' + value + '&', '')
      locationQuery[ queryParamName ] = newParamString
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
    return dispatch(replace({ pathname: pathname, query: locationQuery }))
  }
}
