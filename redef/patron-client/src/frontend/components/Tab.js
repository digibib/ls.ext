import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as ResourceActions from '../actions/ResourceActions'

class Tab extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  handleClick () {
    if (this.props.tab.path && this.props.push) {
      this.props.push({ pathname: this.props.tab.path })
    } else if (this.props.tab.tabId) {
      this.props.selectTab(this.props.menuId, this.props.tab.tabId, true)
    }
  }

  handleKey (event) {
    let el
    if (event.keyCode === 39) { // Arrow right
      event.preventDefault()
      const nextTab = this.props.findNextTab()
      this.props.push({ pathname: nextTab.path })

      // Make sure the focus is moved to active a-element
      el = document.getElementById(nextTab.path)

      if (el) {
        el.firstChild.focus()
      }
    }

    if (event.keyCode === 37) { // Arrow left
      event.preventDefault()
      const prevTab = this.props.findPrevTab()
      this.props.push({ pathname: prevTab.path })

      // Make sure the focus is moved to active a-element
      el = document.getElementById(prevTab.path)

      if (el) {
        el.firstChild.focus()
      }
    }
  }

  render () {
    const { className, tab, ariaSelected, id } = this.props
    return (
      <li
        id={id}
        className={className}
        onClick={this.handleClick}
        onKeyDown={this.handleKey}>
        <Link
          role="tab"
          aria-selected={ariaSelected}
          tabIndex={ariaSelected === 'true' ? 0 : -1}>
          {tab.label}
        </Link>
      </li>
    )
  }
}

Tab.propTypes = {
  findPrevTab: PropTypes.func.isRequired,
  findNextTab: PropTypes.func.isRequired,
  tab: PropTypes.object.isRequired,
  push: PropTypes.func,
  className: PropTypes.string.isRequired,
  ariaSelected: PropTypes.string.isRequired,
  selectTab: PropTypes.func.isRequired,
  menuId: PropTypes.string,
  id: PropTypes.string
}

function mapStateToProps (state) {
  return state
}

function mapDispatchToProps (dispatch) {
  return {
    selectTab: bindActionCreators(ResourceActions.updateUrlQueryValue, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tab)
