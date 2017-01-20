/**
 * Created by Nikolai on 06/09/16.
 */
/* eslint-env mocha */
/* global findElementByDataAutomationId */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilterBoxItem from '../../src/frontend/components/SearchFilterBoxItem'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    filter: {id: 'test_id', active: false, bucket: 'test_bucket'},
    toggleFilter: expect.createSpy(),
    ...propOverrides
  }

  const messages = {'test_bucket': 'test_bucket_translation'}

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
      <SearchFilterBoxItem {...props} />
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
  describe('SearchFilterBoxItem', () => {
    it('should render translated filter name', () => {
      const { node, messages, props } = setup()
      expect(node.querySelector("[data-automation-id='filter_label']").textContent).toEqual(`Filtered on ${messages[props.filter.bucket]}`)
    })

    it('should toggle filter when clicked', () => {
      const { output, props } = setup()
      const label = findElementByDataAutomationId(output, 'filter_label')
      TestUtils.Simulate.click(label)
      expect(props.toggleFilter).toHaveBeenCalled()
      expect(props.toggleFilter.calls[ 0 ].arguments[ 0 ]).toBe(props.filter.id)
    })
  })
})

