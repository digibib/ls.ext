import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import ClickableElement from '../components/ClickableElement'

const SearchFilterBoxItem = ({ filter, toggleFilter, intl }) => {
  return (
    <ClickableElement onClickAction={toggleFilter} onClickArguments={[ filter.id ]}>
      <li className="active-filter" data-automation-id={filter.id}>
                <span className="filter-label" data-automation-id="filter_label">
                    {intl.formatMessage({ id: filter.bucket })}{/* ({filter.count}) */}
                </span>
        <span className="remove"><i className="icon-cancel-1" /></span>
      </li>
    </ClickableElement>
  )
}

SearchFilterBoxItem.propTypes = {
  filter: PropTypes.object.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(SearchFilterBoxItem)
