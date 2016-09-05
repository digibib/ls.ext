import { toggleParameter, toggleParameterValue } from './ParameterActions'

export function toggleFilter (filterId) {
  return (dispatch, getState) => {
    const locationQuery = { ...getState().routing.locationBeforeTransitions.query }

    // Toggling a filter implies a new search, so we discard any pagination parameter
    delete locationQuery.page

    dispatch(toggleParameterValue('filter', filterId, locationQuery))
  }
}

export function toggleFilterVisibility (aggregation) {
  return toggleParameterValue('showMore', aggregation)
}

export function toggleAllFiltersVisibility () {
  return toggleParameter('hideFilters')
}

export function toggleCollapseFilter (aggregation) {
  return toggleParameterValue('collapse', aggregation)
}
