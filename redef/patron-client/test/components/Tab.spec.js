/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Tab, { __RewireAPI__ as DefaultExportTabRewireApi } from '../../src/frontend/components/Tab'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    tab: { label: 'test_label', path: 'test_path' },
    push: expect.createSpy(),
    findPrevTab: () => { return { label: 'test_label', path: 'test_path' } },
    findNextTab: () => { return { label: 'test_label', path: 'test_path' } },
    className: '',
    ariaSelected: 'false',
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
      <Tab {...props} />
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
    DefaultExportTabRewireApi.__Rewire__('Tab', () => <div />)
  })

  after(() => {
    DefaultExportTabRewireApi.__ResetDependency__('Tab')
  })

  describe('Tab', () => {
    it('should render label on tab', () => {
      const { node, props } = setup()
      expect(node.textContent).toEqual(props.tab.label)
    })

    it('should push path when clicked', () => {
      const { output, props } = setup()
      TestUtils.Simulate.click(TestUtils.findRenderedDOMComponentWithTag(output, 'li'))
      expect(props.push).toHaveBeenCalled()
      expect(props.push.calls[ 0 ].arguments[ 0 ]).toEqual({ pathname: props.tab.path })
    })

    it('should push path when keydown arrow left', () => {
      const { output, props } = setup()
      TestUtils.Simulate.keyDown(TestUtils.findRenderedDOMComponentWithTag(output, 'li'), {key: 'Arrow left', keyCode: 37, which: 37})
      expect(props.push).toHaveBeenCalled()
      expect(props.push.calls[ 0 ].arguments[ 0 ]).toEqual({ pathname: props.tab.path })
    })

    it('should push path when keydown arrow right', () => {
      const { output, props } = setup()
      TestUtils.Simulate.keyDown(TestUtils.findRenderedDOMComponentWithTag(output, 'li'), {key: 'Arrow right', keyCode: 39, which: 39})
      expect(props.push).toHaveBeenCalled()
      expect(props.push.calls[ 0 ].arguments[ 0 ]).toEqual({ pathname: props.tab.path })
    })
  })
})
