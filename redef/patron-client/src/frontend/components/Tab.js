import React, { PropTypes } from 'react'

class Tab extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (tab) {
    this.props.push({ pathname: this.props.tab.path })
  }

  render () {
    const { className, tab } = this.props
    return (
      <li className={className} onClick={this.handleClick}>{tab.label}</li>
    )
  }
}

Tab.propTypes = {
  tab: PropTypes.object.isRequired,
  push: PropTypes.func.isRequired,
  className: PropTypes.string.isRequired
}

export default Tab

