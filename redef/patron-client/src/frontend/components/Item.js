import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import Constants from '../constants/Constants'

class Item extends React.Component {
  render () {
    const { item } = this.props
    const languages = [ ...new Set(item.languages.map(language => this.props.intl.formatMessage({ id: language }))) ]
    const mediaType = item.mediaType ? this.props.intl.formatMessage({ id: item.mediaType }) : ''
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
}

Item.propTypes = {
  item: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Item)
