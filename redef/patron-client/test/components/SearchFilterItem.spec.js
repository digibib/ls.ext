/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilterItem from '../../src/frontend/components/SearchFilterItem'
import ReactDOM from 'react-dom'
import {IntlProvider} from 'react-intl'

function setup (propOverrides) {
  const props = {
    filter: {id: 'test_id', active: false, bucket: 'test_bucket', count: 10},
    toggleFilter: expect.createSpy(),
    scrollTargetNode: {},
    ...propOverrides
  }

  const messages = {'test_bucket': 'test_bucket_translation'}

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
      <SearchFilterItem {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output),
    messages: messages
  }
}

describe('components', () => {
  describe('SearchFilterItem', () => {
    it('should render translated filter name', () => {
      const { node, messages, props } = setup()
      expect(node.querySelector("[data-automation-id='filter_label']").textContent).toEqual(`${messages[ props.filter.bucket ]} (10)`)
    })

    it('should have checked checkbox when active filter', () => {
      const { node } = setup({filter: {id: 'test_id', active: true, bucket: 'test_bucket'}})
      expect(node.getElementsByTagName('input')[0].checked).toEqual(true)
    })

    /*
    it('should toggle filter when clicked', () => {
      const { output, props } = setup()
      const label = findElementByDataAutomationId(output, 'filter_label')
      TestUtils.Simulate.click(label)
      expect(props.toggleFilter).toHaveBeenCalled()
      expect(props.toggleFilter.calls[ 0 ].arguments[ 0 ]).toBe(props.filter.id)
    })
    */
  })
})
