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

    if (queryParamName === 'showBranchStatusMedia') {
      if (!Array.isArray(locationQuery[ queryParamName ])) {
        locationQuery[ queryParamName ] = [ value ]
      }
      const branchValue = value.split('_')[0]
      const activeBranchFilters = getActiveBranchFilters(locationQuery)
      activeBranchFilters.map(el => {
        if (el === branchValue) {
          locationQuery[ queryParamName ].push(value)
        }
      })
    }
    if (queryParamName !== 'showBranchStatus' && queryParamName !== 'showBranchStatusMedia') {
      let branchToShow
      const homeBranch = getState().profile.personalInformation.homeBranch
      if (homeBranch) {
        branchToShow = homeBranch
      } else {
        branchToShow = 'hutl'
      }
      const locationQueryWithBranches = ensureBranchStatus(locationQuery, branchToShow)
      return dispatch(push({ pathname: pathname, query: locationQueryWithBranches }))
    } else {
      return dispatch(push({ pathname: pathname, query: locationQuery }))
    }
  }
}

export function ensureDefinedFiltersOpen (inputLocationQuery) {
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

    locationQuery[ 'showFilter' ] = [ 'language' ]
    locationQuery[ 'showFilter' ].push([ 'mediatype' ])

    return dispatch(replace({ pathname: pathname, query: locationQuery }))
  }
}

export function initialBranchStatus (queryParamName, value, inputLocationQuery) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = inputLocationQuery || { ...getState().routing.locationBeforeTransitions.query }
    console.log('locationQuery', locationQuery)
    return dispatch(replace({ pathname: pathname, query: locationQuery }))
  }
}


export function initialStatus (queryParamName, value, inputLocationQuery) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = inputLocationQuery || { ...getState().routing.locationBeforeTransitions.query }
    console.log('locationQuery', locationQuery)
    return dispatch(replace({ pathname: pathname, query: locationQuery }))
  }
}

function ensureBranchStatus (locationQuery, homeBranch) {
  const activeBranchFilters = getActiveBranchFilters(locationQuery)

  if (activeBranchFilters.length === 0) {
    delete locationQuery[ 'showBranchStatus' ]
    if (homeBranch !== undefined) {
      locationQuery[ 'showBranchStatus' ] = [ homeBranch ]
    }
  }

  activeBranchFilters.map((el, i) => {
    if (i === 0) {
      locationQuery[ 'showBranchStatus' ] = [ el.split('branch_').pop() ]
    } else {
      locationQuery[ 'showBranchStatus' ].push(el.split('branch_').pop())
    }
  })
  return locationQuery
}

function getActiveBranchFilters (locationQuery) {
  const activeBranchFilters = []
  if (locationQuery.filter) {
    if (!Array.isArray(locationQuery.filter) && locationQuery.filter.includes('branch')) {
      activeBranchFilters.push(locationQuery.filter)
      return activeBranchFilters
    }
    if (Array.isArray(locationQuery.filter)) {
      locationQuery.filter.map(e => {
        if (e.includes('branch')) {
          activeBranchFilters.push(e)
        }
      })
    }
  }
  return activeBranchFilters
}

export function togglePeriodParamValues (yearFrom, yearTo, years, inputLocationQuery) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = inputLocationQuery || { ...getState().routing.locationBeforeTransitions.query }
    const queryParam = []

    queryParam[ 0 ] = years.yearFrom
    queryParam[ 1 ] = years.yearTo

    if (queryParam[ 0 ] === '' || queryParam[ 0 ] === undefined) {
      delete locationQuery[ yearFrom ]
    } else {
      locationQuery[ yearFrom ] = queryParam[0]
    }

    if (queryParam[ 1 ] === '' || queryParam[ 1 ] === undefined) {
      delete locationQuery[ yearTo ]
    } else {
      locationQuery[ yearTo ] = queryParam[1]
    }

    return dispatch(push({ pathname: pathname, query: locationQuery }))
  }
}

export function deletePeriodParamValues (yearFrom, yearTo, years, inputLocationQuery, shouldRemoveInBackString = false, queryParamName) {
  return (dispatch, getState) => {
    const pathname = getState().routing.locationBeforeTransitions.pathname
    const locationQuery = inputLocationQuery || { ...getState().routing.locationBeforeTransitions.query }

    const queryParam = locationQuery[ queryParamName ] || []

    if (shouldRemoveInBackString) {
      let replacedParams
      replacedParams = queryParam.replace(`${yearFrom}=${years.yearFrom}&`, '')
      replacedParams = replacedParams.replace(`${yearTo}=${years.yearTo}`, '')
      locationQuery[ queryParamName ] = replacedParams
    } else {
      if (years.yearFrom) {
        delete locationQuery[ yearFrom ]
      }
      if (years.yearTo) {
        delete locationQuery[ yearTo ]
      }
    }

    return dispatch(push({ pathname: pathname, query: locationQuery }))
  }
}
