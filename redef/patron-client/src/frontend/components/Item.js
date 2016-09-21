import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import Constants from '../constants/Constants'

const Item = ({ publication, item, intl }) => {
  const languages = [ ...new Set(publication.languages.map(language => intl.formatMessage({ id: language }))) ]
  const mediaType = publication.mediaTypes[ 0 ] ? intl.formatMessage({ id: publication.mediaTypes[ 0 ] }) : ''
  return (
    <tr about={item.barcode}>
      <td className="entry-content-icon-single" data-automation-id="item_media_type">
        <i className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} />{mediaType}
      </td>
      <td data-automation-id="item_languages">{item.mediaType} {languages.join(', ')}</td>
      <td data-automation-id="item_shelfmark">{/* item.location */}{item.shelfmark}</td>
      <td data-automation-id="item_status">{item.available} av {item.total} ledige</td>
    </tr>
  )
}

Item.propTypes = {
  publication: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Item)
