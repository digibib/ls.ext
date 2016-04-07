import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

import Item from './Item'

export default React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired
  },
  renderEmpty () {
    return <p data-automation-id='no_items'><FormattedMessage {...messages.noItems}/></p>
  },
  renderAllItems () {
    return (
      <table>
        <thead>
        <tr>
          <th><FormattedMessage {...messages.branch}/></th>
          <th><FormattedMessage {...messages.count}/></th>
          <th><FormattedMessage {...messages.placement}/></th>
          <th><FormattedMessage {...messages.status}/></th>
        </tr>
        </thead>
        <tbody data-automation-id='work_items'>
        {this.props.items.map(item => {
          return <Item key={item.barcode} item={item}/>
        })}
        </tbody>
      </table>
    )
  },
  renderItems () {
    return this.props.items.length > 0
      ? this.renderAllItems()
      : this.renderEmpty()
  },
  render () {
    return this.props.items.length > 0
      ? this.renderAllItems()
      : this.renderEmpty()
  }
})

const messages = defineMessages({
  branch: {
    id: 'Items.branch', description: 'Branch of item', defaultMessage: 'branch'
  },
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
  }
})
