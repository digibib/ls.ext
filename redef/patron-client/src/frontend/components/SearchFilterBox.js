import React, { PropTypes } from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'

import SearchFilterBoxItem from '../components/SearchFilterBoxItem'
import SearchFilterDateRangeBoxItem from '../components/SearchFilterDateRangeBoxItem'
import { getFiltersFromQuery, getDateRange } from '../utils/filterParser'
import { defineMessages, FormattedMessage } from 'react-intl'

const SearchFilterBox = ({ toggleFilter, togglePeriod, query }) => {
  const filterText = query.back ? <FormattedMessage {...messages.titleWork} />
    : <FormattedMessage {...messages.titleSearch} />
  const filters = getFiltersFromQuery(query).filter(f => {
    // We want to hide filters on work-level properties, since
    // they by definition allways match all publications of the given work.
    return !f.id.startsWith('fictionNonfiction') && !f.id.startsWith('audience')
  })

  const dateRange = []

  if (getDateRange(query, 'yearFrom') !== null) {
    dateRange.push({ yearFrom: getDateRange(query, 'yearFrom') })
  }

  if (getDateRange(query, 'yearTo') !== null) {
    dateRange.push({ yearTo: getDateRange(query, 'yearTo')})
  }


  /*if (dateFilterFrom !== null && dateFilterTo !== null) {
    dateRangeEl = <li role="button" className="active-filter" tabindex="0">
      <span className="filter-label">fom {dateFilterFrom}</span>&nbsp;-&nbsp;
      <span className="filter-label">tom {dateFilterTo}</span>
      <span className="remove">
        <i className="icon-cancel-1"></i>
      </span>
    </li>

  }*/

  if (filters.length > 0 || dateRange.length > 0) {
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="active-filters">
        <div className="label">{filterText}</div>
        <ul>
          {filters.filter((filter) => filter.active).map((filter) => <SearchFilterBoxItem
            key={filter.id} filter={filter} toggleFilter={toggleFilter} />)}
          { dateRange.length > 0
            ? <SearchFilterDateRangeBoxItem dateRange={dateRange} togglePeriod={togglePeriod} />
            : null
          }
        </ul>
      </NonIETransitionGroup>
    )
  } else {
    return null
  }
}

export const messages = defineMessages({
  titleSearch: {
    id: 'SearchFilterBox.title.search',
    description: 'title text for the SearchFilterItemBox on the search page',
    defaultMessage: 'Delimited to:'
  },
  titleWork: {
    id: 'SearchFilterBox.title.work',
    description: 'title text for the SearchFilterItemBox on the work page',
    defaultMessage: 'Publications that fit your delimiters:'
  }
})

SearchFilterBox.propTypes = {
  toggleFilter: PropTypes.func.isRequired,
  query: PropTypes.object.isRequired
}

export default SearchFilterBox
