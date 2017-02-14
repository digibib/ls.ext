import { toggleParameter, toggleParameterValue } from './ParameterActions'

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
  return toggleParameter('hideFilters')
}

export function toggleCollapseFilter (aggregation) {
  return toggleParameterValue('showFilter', aggregation)
}
