import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import Constants from '../constants/Constants'

const Item = ({ item, intl }) => {
  const languages = [ ...new Set(item.languages.map(language => intl.formatMessage({ id: language }))) ]
  const mediaType = item.mediaTypes[ 0 ]
  return (
    <tr about={item.barcode}>
      <td className="entry-content-icon-single" data-automation-id="item_media_type">
        <i
          className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ mediaType ] ]} />{mediaType ? intl.formatMessage({ id: mediaType }) : ''}
      </td>
      <td
        data-automation-id="item_languages">{languages.join(', ')}</td>
      <td data-automation-id="item_shelfmark">{item.shelfmark}</td>
      <td data-automation-id="item_status">{item.available} av {item.total} ledige</td>
    </tr>
  )
}

Item.propTypes = {
  item: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Item)
