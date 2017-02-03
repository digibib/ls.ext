import React, { PropTypes } from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'

import SearchFilterBoxItem from '../components/SearchFilterBoxItem'
import { getFiltersFromQuery } from '../utils/filterParser'
import { defineMessages, FormattedMessage } from 'react-intl'

const SearchFilterBox = ({ toggleFilter, query }) => {
  const filterText = query.back ? <FormattedMessage {...messages.titleWork} />
    : <FormattedMessage {...messages.titleSearch} />
  const filters = getFiltersFromQuery(query).filter(f => {
    // We want to hide filters on work-level properties, since
    // they by definition allways match all publications of the given work.
    return !f.id.startsWith('fictionNonfiction') && !f.id.startsWith('audience')
  })
  if (filters.length > 0) {
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
