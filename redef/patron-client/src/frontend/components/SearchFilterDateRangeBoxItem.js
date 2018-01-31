import React, { PropTypes } from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ClickableElement from '../components/ClickableElement'

const SearchFilterBoxItemDateRange = ({ dateRange, removePeriod }) => {
  const filterText = <FormattedMessage {...messages.filterTitle} />

  const dateEl = dateRange.map((el) => {
    if (el.hasOwnProperty('yearFrom')) {
      return <span key="yearFrom">{el.yearFrom}</span>
    }

    if (el.hasOwnProperty('yearTo')) {
      return <span key="yearTo">{el.yearTo}</span>
    }

    return el
  })

  if (dateEl.length === 2) {
    dateEl.splice(1, 0, ' - ')
  }

  if (dateEl.length === 1 && dateEl[0].key === 'yearFrom') {
    dateEl.splice(1, 0, ' - ')
  }

  if (dateEl.length === 1 && dateEl[0].key === 'yearTo') {
    dateEl.splice(0, 0, ' - ')
  }

  const mergedDates = Object.assign(...dateRange)
  return (
    <ClickableElement onClickAction={removePeriod} onClickArguments={mergedDates}>
      <li role="button" className="active-filter" data-automation-id="search-filter-date-range" tabIndex="0">
        <span className="filter-label" data-automation-id="filter_label">
        <span className="is-vishidden">{filterText}</span>
          {dateEl}
        </span>
        <img className="icon" src="/images/x.svg" />
      </li>
    </ClickableElement>
  )
}

export const messages = defineMessages({
  filterTitle: {
    id: 'SearchFilterBoxItem.title.filter',
    description: 'title for search filters (UU) on the search page',
    defaultMessage: 'Filtered on'
  },
  from: {
    id: 'SearchFilterBoxItem.from',
    description: 'Text in filter box from and including a given date',
    defaultMessage: 'from'
  },
  to: {
    id: 'SearchFilterBoxItem.to',
    description: 'Text in filter box to and including a given date',
    defaultMessage: 'to'
  }

})

SearchFilterBoxItemDateRange.propTypes = {
  removePeriod: PropTypes.func.isRequired,
  dateRange: PropTypes.array
}

export default injectIntl(SearchFilterBoxItemDateRange)

