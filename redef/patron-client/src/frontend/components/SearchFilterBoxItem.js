import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl'
import ClickableElement from '../components/ClickableElement'

const SearchFilterBoxItem = ({ filter, toggleFilter, intl }) => {
  const filterText = <FormattedMessage {...messages.filterTitle} />
  return (
    <ClickableElement onClickAction={toggleFilter} onClickArguments={[ filter.id ]}>
      <li role="button" className="active-filter" data-automation-id={filter.id} tabIndex="0">
                <span className="filter-label" data-automation-id="filter_label">
                  <span className="is-vishidden">{filterText}</span> {intl.formatMessage({ id: filter.bucket })}{/* ({filter.count}) */}
                </span>
        <span className="remove"><img className="icon" src="/images/x.svg" /></span>
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

SearchFilterBoxItem.propTypes = {
  filter: PropTypes.object.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(SearchFilterBoxItem)
