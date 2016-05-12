import React, { PropTypes } from 'react'
import { matchPattern } from 'react-router/lib/PatternUtils'

export default React.createClass({
  propTypes: {
    tabList: PropTypes.array.isRequired,
    push: PropTypes.func.isRequired,
    currentPath: PropTypes.string.isRequired,
    tabClass: PropTypes.string.isRequired,
    tabActiveClass: PropTypes.string.isRequired
  },
  getDefaultProps () {
    return {
      tabClass: 'tab-bar-tab',
      tabActiveClass: 'tab-bar-tab-active'
    }
  },
  handleClick (tab) {
    this.props.push({ pathname: tab.path })
  },
  render () {
    return (
      <div className='row'>
        <ul className='tab-bar'>
          {this.props.tabList.map(tab => (
            <li key={tab.label}
                className={matchPattern(tab.path, this.props.currentPath) ? `${this.props.tabClass} ${this.props.tabActiveClass}` : this.props.tabClass}
                onClick={this.handleClick.bind(this, tab)}>{tab.label}</li>
          ))}
        </ul>
      </div>
    )
  }
})
