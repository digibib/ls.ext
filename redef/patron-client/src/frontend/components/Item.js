import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import Constants from '../constants/Constants'

const Item = ({ item, intl }) => {
  const languages = [ ...new Set(item.languages.map(language => intl.formatMessage({ id: language }))) ]
  return (
    <div role="row" className="flex-wrapper sub-wrapper">
      <div data-automation-id="item_languages" className="flex-item sub-row">{languages.join(', ')}</div>
      <div data-automation-id="item_shelfmark" className="flex-item sub-row">{item.shelfmark}</div>
      <div data-automation-id="item_status" className="flex-item sub-row">{item.available} av {item.total} ledige</div>
    </div>
  )
}

Item.propTypes = {
  item: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Item)