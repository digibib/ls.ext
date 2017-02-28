import React, { PropTypes } from 'react'
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl'
import ClickableElement from '../components/ClickableElement'

const SearchFilterBoxItemDateRange = ({ dateRange, togglePeriod }) => {
  console.log('dateRange', dateRange)
  const filterText = <FormattedMessage {...messages.filterTitle} />

  const dateEl = dateRange.map((el) => {
    if (el.hasOwnProperty('yearFrom')) {
      return <span>fom: {el.yearFrom} </span>
    }

    if (el.hasOwnProperty('yearTo')) {
      return <span> tom: {el.yearTo}</span>
    }
  })
  let mergedDates = Object.assign(...dateRange); // ES6 (2015) syntax
  console.log(mergedDates)
  return (
    <ClickableElement onClickAction={togglePeriod} onClickArguments={mergedDates}>
      <li role="button" className="active-filter" data-automation-id='search-filter-date-range' tabindex="0">
        <span className="filter-label" data-automation-id="filter_label">
        <span className="is-vishidden">{filterText}</span>
          {dateEl}
        </span>
        <span className="remove"><i className="icon-cancel-1" /></span>
      </li>
    </ClickableElement>
  )
}

export const messages = defineMessages({
  filterTitle: {
    id: 'SearchFilterBoxItem.title.filter',
    description: 'title for search filters (UU) on the search page',
    defaultMessage: 'Filtered on'
  }
})

SearchFilterBoxItemDateRange.propTypes = {
  togglePeriod: PropTypes.func.isRequired
}

export default injectIntl(SearchFilterBoxItemDateRange)

/*
 <ClickableElement onClickAction={toggleFilter} onClickArguments={[ filter.id ]}>
 <li role="button" className="active-filter" data-automation-id={filter.id} tabIndex="0">
 <span className="filter-label" data-automation-id="filter_label">
 <span className="is-vishidden">{filterText}</span> {intl.formatMessage({ id: filter.bucket })}
</span>
<span className="remove"><i className="icon-cancel-1" /></span>
  </li>
  </ClickableElement>

 {dateRange.map((el) => {
 <span>el.yearFrom</span>
 })}
 */
