import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

const Item = React.createClass({
  propTypes: {
    item: PropTypes.object.isRequired,
    intl: intlShape.isRequired
  },
  renderStatus (status) {
    return status === 'AVAIL'
      ? <span><FormattedMessage {...messages.available} /></span>
      : <span><FormattedMessage {...messages.expectedAvailable} values={{status: status}}/></span>
  },
  render () {
    let item = this.props.item
    return (
      <tr about={item.barcode}>
        <td data-automation-id='item_branch'>{item.branch}</td>
        <td data-automation-id='item_count'>{item.count}</td>
        <td data-automation-id='item_shelfmark'>{item.shelfmark}</td>
        <td data-automation-id='item_status'>{this.renderStatus(item.status)}</td>
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

export default injectIntl(Item)
