import { toggleParameter, toggleParameterValue, togglePeriodParamValues, deletePeriodParamValues } from './ParameterActions'
import { push } from 'react-router-redux'

export function toggleFilter (filterId) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(toggleParameterValue('filter', filterId, locationQuery))
  }
}

export function removeFilterInBackUrl (filterId) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(toggleParameterValue('back', filterId, locationQuery, true, 'filter'))
  }
}

export function toggleFilterVisibility (aggregation) {
  return toggleParameterValue('showMore', aggregation)
}

export function toggleAllFiltersVisibility () {
  // return toggleParameter('hideFilters')
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    dispatch(toggleParameter('hideFilters', locationQuery))
  }
}

export function toggleCollapseFilter (aggregation) {
  return toggleParameterValue('showFilter', aggregation)
}

export function togglePeriod (years) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(togglePeriodParamValues('yearFrom', 'yearTo', years, locationQuery))
  }
}

export function toggleAvailability () {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(toggleParameter('excludeUnavailable'))
  }
}

export function toggleHideNoItems () {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(toggleParameter('includeWithoutItems'))
  }
}

export function removeAvailabilityInBackUrl () {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    dispatch(toggleParameter('excludeUnavailable', locationQuery, true))
  }
}

export function removePeriod (years) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    dispatch(deletePeriodParamValues('yearFrom', 'yearTo', years, locationQuery))
  }
}

export function removePeriodInBackUrl (years) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    dispatch(deletePeriodParamValues('yearFrom', 'yearTo', years, locationQuery, true, 'back'))
  }
}

export function removeAllFilters () {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }
    dispatch(push({ pathname: '/search', query: { query: locationQuery.query } }))
  }
}
