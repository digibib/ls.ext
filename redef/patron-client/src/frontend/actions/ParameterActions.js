import { replace } from 'react-router-redux'
import createPath from '../utils/createPath'

export function toggleParameter (pathname, queryParamName) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    const queryParam = locationQuery[ queryParamName ]
    if (queryParam !== undefined) {
      delete locationQuery[ queryParamName ]
    } else {
      locationQuery[ queryParamName ] = null // null enables the parameter
    }
    const url = createPath({ pathname: pathname, query: locationQuery })
    return dispatch(replace(url))
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
      delete locationQuery [ queryParamName ]
    } else {
      locationQuery[ queryParamName ] = queryParam
    }
    const url = createPath({ pathname: pathname, query: locationQuery })
    return dispatch(replace(url))
  }
}
