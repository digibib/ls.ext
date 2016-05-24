/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Tabs, { __RewireAPI__ as DefaultExportTabsRewireApi } from '../../src/frontend/components/Tabs'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    tabList: [ { label: 'label_1', path: '/path_1' }, { label: 'label_2', path: '/path_2' }, { label: 'label_3', path: '/path_3' } ],
    push: () => {},
    currentPath: '',
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Tabs {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  before(() => {
    DefaultExportTabsRewireApi.__Rewire__('Tab', React.createClass({
      propTypes: {
        className: React.PropTypes.string.isRequired
      },
      render () {
        return (
          <div className={this.props.className} />
        )
      }
    }))
  })

  after(() => {
    DefaultExportTabsRewireApi.__ResetDependency__
  })

  describe('Tabs', () => {
    it('should render an element for every tab', () => {
      const { node, props } = setup()
      expect(node.querySelector("[data-automation-id='tabs']").children.length).toEqual(props.tabList.length)
    })

    it('should mark tab as active depending on current path', () => {
      const { node } = setup({currentPath: '/path_2'})
      const tabs = node.querySelector("[data-automation-id='tabs']").children
      expect(tabs[0].getAttribute('class')).toContain(Tabs.defaultProps.tabClass)
      expect(tabs[0].getAttribute('class')).toNotContain(Tabs.defaultProps.tabActiveClass)
      expect(tabs[1].getAttribute('class')).toContain(Tabs.defaultProps.tabClass)
      expect(tabs[1].getAttribute('class')).toContain(Tabs.defaultProps.tabActiveClass)
      expect(tabs[2].getAttribute('class')).toContain(Tabs.defaultProps.tabClass)
      expect(tabs[2].getAttribute('class')).toNotContain(Tabs.defaultProps.tabActiveClass)
    })
  })
})
