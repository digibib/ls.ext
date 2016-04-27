import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

export default React.createClass({
  propTypes: {
    tabList: PropTypes.array.isRequired,
    push: PropTypes.func.isRequired,
    currentPath: PropTypes.string.isRequired
  },
  handleClick (tab) {
    this.props.push({pathname: tab.path})
  },
  render () {
    return (
      <div className='row'>
        <ul style={{listStyleType: 'none', margin: 0, padding: 0}}>
          {this.props.tabList.map(tab=>
            <li key={tab.label} style={{float: 'left', padding: '1.5em', backgroundColor: this.props.currentPath === tab.path ? '#ddd' : '#eee'}}
                onClick={this.handleClick.bind(this, tab)}>{tab.label}</li>
          )}
        </ul>
      </div>
    )
  }
})