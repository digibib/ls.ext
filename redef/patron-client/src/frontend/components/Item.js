import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'

class Item extends React.Component {
  render () {
    let item = this.props.item
    return (
      <tr about={item.barcode}>
        <td data-automation-id='item_branch'>{item.branch}</td>
        <td data-automation-id='item_count'>{item.count}</td>
        <td data-automation-id='item_shelfmark'>{item.shelfmark}</td>
        <td data-automation-id='item_status'>{item.status}</td>
      </tr>
    )
  }
}

Item.propTypes = {
  item: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Item)
