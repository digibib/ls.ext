import React, { PropTypes } from 'react'
import { Link, History } from 'react-router'

class Tab extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  // Make sure the focus is moved to active a-element
  componentDidUpdate () {
    const el = document.getElementsByClassName('tab-bar-tab-active')
    if (el[0] !== undefined) {
      el[ 0 ].firstChild.focus()
    }
  }

  handleClick (tab) {
    this.props.push({ pathname: this.props.tab.path })
  }

  handleKey (event) {
    if (event.keyCode === 39) { // Arrow right
      event.preventDefault()
      const nextTab = this.props.findNextTab()
      this.props.push({ pathname: nextTab.path })
    }

    if (event.keyCode === 37) { // Arrow left
      event.preventDefault()
      const prevTab = this.props.findPrevTab()
      this.props.push({ pathname: prevTab.path })
    }
  }

  render () {
    const { className, tab, ariaSelected} = this.props
    return (
      <li
        className={className}
        onClick={this.handleClick}
        onKeyDown={this.handleKey}
        aria-role="presentation"
      >
        <Link
          to="#"
          role="tab"
          aria-selected={ariaSelected}
          tabIndex={ariaSelected === 'true' ? 0 : -1}
        >
          {tab.label}
        </Link>
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

//  <Link to="#" role="tab" aria-selected={ariaSelected}>{tab.label}</Link>