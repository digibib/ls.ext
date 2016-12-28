import React, {PropTypes} from "react"
import {matchPattern} from "react-router/lib/PatternUtils"
import Tab from "./Tab"

class Tabs extends React.Component {
  render () {
    return (
      <div role="menubar">
        <ul className={this.props.tabBarClass} data-automation-id="tabs" role="menu" aria-label={this.props.label}>
          {this.props.tabList.map(tab => (
            <Tab key={tab.label}
                 tab={tab}
                 menuId={this.props.menuId}
                 className={(tab.path ? matchPattern(tab.path, this.props.currentPath) : tab.tabId === this.props.currentTab )  ? `${this.props.tabClass} ${this.props.tabActiveClass}` : this.props.tabClass}
                 ariaSelected={(tab.path ? matchPattern(tab.path, this.props.currentPath) : tab.tabId === this.props.currentTab ) ? 'true' : 'false'}
                 push={this.props.push} />
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
  menuId: PropTypes.string
}

Tabs.defaultProps = {
  tabBarClass: 'tab-bar',
  tabClass: 'tab-bar-tab',
  tabActiveClass: 'tab-bar-tab-active'
}

export default Tabs

