import React, { PropTypes } from 'react'

import SearchFilterBoxItem from '../components/SearchFilterBoxItem'
import { getFiltersFromQuery } from '../utils/filterParser'
import { defineMessages, FormattedMessage } from 'react-intl'

const SearchFilterBox = ({ toggleFilter, query }) => {
  const filterText = query.back ? <FormattedMessage {...messages.titleWork} />
   : <FormattedMessage {...messages.titleSearch} />
  if (getFiltersFromQuery(query).length > 0) {
    return (<div className="active-filters">
      <div className="label">{filterText}</div>
      <ul>
        {getFiltersFromQuery(query).filter((filter) => filter.active).map((filter) => <SearchFilterBoxItem
          key={filter.id} filter={filter} toggleFilter={toggleFilter} />)}
      </ul>
    </div>)
  } else {
    return null
  }
}

const messages = defineMessages({
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
