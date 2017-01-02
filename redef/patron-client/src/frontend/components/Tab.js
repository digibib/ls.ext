import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import * as ResourceActions from '../actions/ResourceActions'

class Tab extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (tab) {
    if (this.props.tab.path && this.props.push) {
      this.props.push({ pathname: this.props.tab.path })
    } else if (this.props.tab.tabId) {
      this.props.selectTab(this.props.tab.tabId, true, this.props.menuId)
    }
  }

  render () {
    const { className, tab, ariaSelected } = this.props
    return (
      <li className={className} onClick={this.handleClick} role="presentation">
        <Link tabIndex="0" role="tab" aria-selected={ariaSelected} title={tab.label}>{tab.label}</Link>
      </li>
    )
  }
}

Tab.propTypes = {
  tab: PropTypes.object.isRequired,
  push: PropTypes.func,
  className: PropTypes.string.isRequired,
  ariaSelected: PropTypes.string.isRequired,
  selectTab: PropTypes.func.isRequired,
  menuId: PropTypes.string
}

function mapStateToProps (state) {
  return state
}

function mapDispatchToProps (dispatch) {
  return {
    selectTab: bindActionCreators(ResourceActions.selectTab, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Tab)

