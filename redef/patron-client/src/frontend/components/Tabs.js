import PropTypes from 'prop-types'
import React from 'react'
import {matchPattern} from 'react-router/lib/PatternUtils'
import Tab from './Tab'

class Tabs extends React.Component {
  constructor (props) {
    super(props)
    this.findNextTab = this.findNextTab.bind(this)
    this.findPrevTab = this.findPrevTab.bind(this)
  }

  findNextTab () {
    const tabListLength = this.props.tabList.length
    for (let i = 0; i < tabListLength; i++) {
      if (matchPattern(this.props.tabList[i].path, this.props.currentPath)) {
        if (i < tabListLength - 1) {
          return this.props.tabList[ i + 1 ]
        } else {
          return this.props.tabList[0]
        }
      }
    }
  }

  findPrevTab () {
    const tabListLength = this.props.tabList.length
    for (let i = 0; i < tabListLength; i++) {
      if (matchPattern(this.props.tabList[i].path, this.props.currentPath)) {
        if (i >= 1) {
          return this.props.tabList[ i - 1 ]
        } else {
          return this.props.tabList[tabListLength - 1]
        }
      }
    }
  }

  render () {
    return (
      <div role="menubar">
        <ul className={this.props.tabBarClass} data-automation-id="tabs" role="tablist" aria-label={this.props.label}>
          {this.props.tabList.map((tab, key) => (
            <Tab key={key}
                 id={tab.path}
                 tab={tab}
                 menuId={this.props.menuId}
                 className={(tab.path ? matchPattern(tab.path, this.props.currentPath) : tab.tabId === this.props.currentTab) ? `${this.props.tabClass} ${this.props.tabActiveClass}` : this.props.tabClass}
                 ariaSelected={(tab.path ? matchPattern(tab.path, this.props.currentPath) : tab.tabId === this.props.currentTab) ? 'true' : 'false'}
                 push={this.props.push}
                 findNextTab={this.findNextTab}
                 findPrevTab={this.findPrevTab}
            />
          ))}
        </ul>
      </div>
    )
  }
}

Tabs.propTypes = {
  label: PropTypes.string.isRequired,
  tabList: PropTypes.array.isRequired,
  push: PropTypes.func,
  currentPath: PropTypes.string,
  currentTab: PropTypes.string,
  tabBarClass: PropTypes.string.isRequired,
  tabClass: PropTypes.string.isRequired,
  tabActiveClass: PropTypes.string.isRequired,
  store: PropTypes.object,
  menuId: PropTypes.string
}

Tabs.defaultProps = {
  tabBarClass: 'tab-bar',
  tabClass: 'tab-bar-tab',
  tabActiveClass: 'tab-bar-tab-active'
}

export default Tabs
