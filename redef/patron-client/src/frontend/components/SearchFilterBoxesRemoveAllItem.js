import React, { PropTypes } from 'react'
import { injectIntl, FormattedMessage, defineMessages } from 'react-intl'
import ClickableElement from '../components/ClickableElement'

const SearchFilterBoxesRemoveAllItem = ({ removeAllFilters }) => {
  return (
    <ClickableElement onClickAction={removeAllFilters}>
      <li role="button" className="active-filter remove-all-filters" data-automation-id="removeAllFilters" tabIndex="0">
        <span className="filter-label"><FormattedMessage {...messages.removeAllTitle} /></span>
      </li>
    </ClickableElement>
  )
}

export const messages = defineMessages({
  removeAllTitle: {
    id: 'SearchFilterBoxItem.removeAll.title',
    description: 'Title for remove all filters button on top',
    defaultMessage: 'Remove filters'
  }
})

SearchFilterBoxesRemoveAllItem.propTypes = {
  removeAllFilters: PropTypes.func.isRequired
}

export default injectIntl(SearchFilterBoxesRemoveAllItem)
