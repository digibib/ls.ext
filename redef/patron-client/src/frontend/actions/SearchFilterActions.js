import { toggleParameter, toggleParameterValue } from './ParameterActions'

export function toggleFilter (aggregation, bucket) {
  const queryParamName = `filter_${aggregation}`
  return toggleParameterValue('/search', queryParamName, bucket)
}

export function toggleFilterVisibility (aggregation) {
  const queryParamName = 'showMore'
  return toggleParameterValue('/search', queryParamName, aggregation)
}

export function toggleAllFiltersVisibility () {
  const queryParamName = 'hideFilters'
  return toggleParameter('/search', queryParamName)
}

export function toggleCollapseFilter (aggregation) {
  const queryParamName = 'collapse'
  return toggleParameterValue('/search', queryParamName, aggregation)
}
