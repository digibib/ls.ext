import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

import Item from './Item'

export default React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired
  },
  renderEmpty () {
    return <h2 data-automation-id='no_items'><FormattedMessage {...messages.noItems}/></h2>
  },
  renderAllItems () {
    return (
      <table>
        <thead>
        <tr>
          <th><FormattedMessage {...messages.title}/></th>
          <th><FormattedMessage {...messages.language}/></th>
          <th><FormattedMessage {...messages.format}/></th>
          <th><FormattedMessage {...messages.barcode}/></th>
          <th><FormattedMessage {...messages.placement}/></th>
          <th><FormattedMessage {...messages.status}/></th>
          <th><FormattedMessage {...messages.shelfmark}/></th>
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
    if (this.props.items.length > 0) {
      return this.renderAllItems()
    }
    return this.renderEmpty()
  },
  render () {
    return (
      <div id='items' className='panel row'>
        <div className='panel-header'>
          <span><strong><FormattedMessage {...messages.numberOfCopies}
            values={{numberOfCopies: this.props.items.length}}/></strong></span>
          <div className='panel-arrow panel-open'></div>
        </div>
        <div className='col'>
          {this.renderItems()}
        </div>
      </div>
    )
  }
})

const messages = defineMessages({
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
