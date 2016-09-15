import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

import Item from './Item'

class Items extends React.Component {
  renderEmpty () {
    return <p><span data-automation-id="no_items"><FormattedMessage {...messages.noItems} /></span></p>
  }

  renderItems () {
    return (
      <table>
        <thead>
        <tr>
          <th><FormattedMessage {...messages.mediaType} /></th>
          <th><FormattedMessage {...messages.language} /></th>
          <th><FormattedMessage {...messages.placement} /></th>
          <th><FormattedMessage {...messages.status} /></th>
        </tr>
        </thead>
        <tbody data-automation-id="work_items">
        {this.props.items.map(item => <Item key={item.barcode} item={item} />)}
        </tbody>
      </table>
    )
  }

  render () {
    return this.props.items.length > 0
      ? this.renderItems()
      : this.renderEmpty()
  }
}

Items.propTypes = {
  items: PropTypes.array.isRequired
}

const messages = defineMessages({
  count: {
    id: 'Items.count', description: 'Count of item', defaultMessage: 'count'
  },
  title: {
    id: 'Items.title', description: 'Title of item', defaultMessage: 'title'
  },
  language: {
    id: 'Items.language', description: 'Language of item', defaultMessage: 'language'
  },
  format: {
    id: 'Items.format', description: 'Format of item', defaultMessage: 'format'
  },
  barcode: {
    id: 'Items.barcode', description: 'Barcode of item', defaultMessage: 'barcode'
  },
  placement: {
    id: 'Items.placement', description: 'Placement of item', defaultMessage: 'placement'
  },
  status: {
    id: 'Items.status', description: 'Status of item', defaultMessage: 'status'
  },
  shelfmark: {
    id: 'Items.shelfmark', description: 'Shelfmark of item', defaultMessage: 'shelfmark'
  },
  noItems: {
    id: 'Items.noItems', description: 'When no items', defaultMessage: 'We have no copies'
  },
  numberOfCopies: {
    id: 'Items.numberOfCopies', description: 'The number of copies', defaultMessage: 'Copies ({numberOfCopies})'
  },
  mediaType: {
    id: 'Items.mediaType', description: 'MediaType of item', defaultMessage: 'type'
  }
})

export default Items
