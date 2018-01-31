import React, { PropTypes } from 'react'
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl'
import ClickableElement from '../components/ClickableElement'

const SearchFilterAvailabilityBoxItem = ({ toggleAvailability, intl }) => {
  const filterText = <FormattedMessage {...messages.filterTitle} />
  return (
    <ClickableElement onClickAction={toggleAvailability}>
      <li role="button" className="active-filter" data-automation-id="availabilityFilterBox" tabIndex="0">
                <span className="filter-label" data-automation-id="filter_label">
                  <span className="is-vishidden">{filterText}</span><FormattedMessage {...messages.label} /></span>
        <img className="icon" src="/images/x.svg" />
      </li>
    </ClickableElement>
  )
}

export const messages = defineMessages({
  filterTitle: {
    id: 'SearchFilterAvailabilityBoxItem.title.filter',
    description: 'title for search filters (UU) on the search page',
    defaultMessage: 'Availability filter on'
  },
  label: {
    id: 'SearchFilterAvailabilityBoxItem.label',
    description: 'label for availability filter box',
    defaultMessage: 'Only show available'
  }
})

SearchFilterAvailabilityBoxItem.propTypes = {
  toggleAvailability: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(SearchFilterAvailabilityBoxItem)
