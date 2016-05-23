import { toggleParameter, toggleParameterValue } from './ParameterActions'

export function toggleFilter (filterId) {
  return toggleParameterValue('filter', filterId)
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
