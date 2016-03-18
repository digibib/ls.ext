import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

export default React.createClass({
  propTypes: {
    item: PropTypes.object.isRequired
  },
  renderStatus (status) {
    if (status === 'AVAIL') {
      return <span><FormattedMessage {...messages.available} /></span>
    }
    return <span><FormattedMessage {...messages.expectedAvailable} values={{status: status}}/></span>
  },
  render () {
    let item = this.props.item
    return (
      <tr about={item.barcode}>
        <td data-automation-id='item_title'>{item.title}</td>
        <td data-automation-id='item_language'>{item.language}</td>
        <td data-automation-id='item_format'>{item.format}</td>
        <td data-automation-id='item_barcode'>{item.barcode}</td>
        <td data-automation-id='item_location'>{item.location}</td>
        <td data-automation-id='item_status'>{this.renderStatus(item.status)}</td>
        <td data-automation-id='item_shelfmark'>{item.shelfmark}</td>
      </tr>
    )
  }
})

const messages = defineMessages({
  available: {
    id: 'Item.available',
    description: 'Available item',
    defaultMessage: 'Available'
  },
  expectedAvailable: {
    id: 'Item.expectedAvailable',
    description: 'When the item is expected available',
    defaultMessage: 'Expected {status}'
  }
})