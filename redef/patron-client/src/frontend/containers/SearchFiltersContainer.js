import React, { PropTypes } from 'react'

import NonIETransitionGroup from '../components/NonIETransitionGroup'
import SearchFilters from '../components/SearchFilters'
import DataRangeFilter from '../components/DateRangeFilter'

class SearchFiltersContainer extends React.Component {
  render () {
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="aside"
        className="filters">

        <SearchFilters {...this.props} />
        <DataRangeFilter />

      </NonIETransitionGroup>
    )
  }
}

export default SearchFiltersContainer