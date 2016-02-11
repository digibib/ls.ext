import React, { PropTypes } from 'react'

import Item from './Item'

export default React.createClass({
  propTypes: {
    items: PropTypes.array.isRequired
  },
  renderEmpty () {
    return <h2>Vi har ingen eksemplarer</h2>
  },
  renderAllItems () {
    return (
      <table>
        <thead>
        <tr>
          <th>tittel</th>
          <th>språk</th>
          <th>format</th>
          <th>strekkode</th>
          <th>plassering</th>
          <th>status</th>
          <th>oppstilling</th>
        </tr>
        </thead>
        <tbody>
        {this.props.items.map(i => {
          return <Item key={i.barcode} item={i}/>
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
          <span><strong>Eksemplarer ({this.props.items.length})</strong></span>
          <div className='panel-arrow panel-open'></div>
        </div>
        <div className='col'>
          {this.renderItems()}
        </div>
      </div>
    )
  }
})
