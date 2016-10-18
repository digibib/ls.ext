import React, { PropTypes } from 'react'
import { Link } from 'react-router'

class Tab extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (tab) {
    this.props.push({ pathname: this.props.tab.path })
  }

  render () {
    const { className, tab, ariaSelected } = this.props
    return (
      <li className={className} onClick={this.handleClick} role="presentation">
        <Link to="#" role="tab" aria-selected={ariaSelected}>{tab.label}</Link>
      </li>
    )
  }
}

Tab.propTypes = {
  tab: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired,
  ariaSelected: PropTypes.string.isRequired
}

export default Tab

