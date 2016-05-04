import { replace } from 'react-router-redux'

export function toggleParameter (pathname, queryParamName) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    const queryParam = locationQuery[ queryParamName ]
    if (queryParam !== undefined) {
      delete locationQuery[ queryParamName ]
    } else {
      locationQuery[ queryParamName ] = null // null enables the parameter
    }
    return dispatch(replace({ pathname: pathname, query: locationQuery }))
  }
}

export function toggleParameterValue (pathname, queryParamName, value) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    let queryParam = locationQuery[ queryParamName ] || []
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
    return dispatch(replace({ pathname: pathname, query: locationQuery }))
  }
}
