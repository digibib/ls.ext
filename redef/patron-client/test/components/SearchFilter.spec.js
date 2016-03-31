/* global describe, it */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilter from '../../src/frontend/components/SearchFilter'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    aggregation: 'aggregation',
    filters: [
      { aggregation: 'test_aggregation', bucket: 'filter_1', count: '10', active: true },
      { aggregation: 'test_aggregation', bucket: 'filter_2', count: '40', active: false },
      { aggregation: 'test_aggregation', bucket: 'filter_3', count: '30', active: false },
      { aggregation: 'test_aggregation', bucket: 'filter_4', count: '20', active: true }
    ],
    locationQuery: {},
    setFilter: () => {},
    ...propOverrides
  }

  const messages = {
    filter_1: 'filter_1',
    filter_2: 'filter_2',
    filter_3: 'filter_3',
    filter_4: 'filter_4'
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en' messages={messages}>
      <SearchFilter {...props} />
    </IntlProvider>)

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('SearchFilter', () => {
    it('should render empty if no filters', () => {
      const { node } = setup({ filters: undefined })
      expect(node.getAttribute('data-automation-id')).toBe('empty')
    })

    it('should render filters', () => {
      const { node } = setup()
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_1']").innerHTML).toContain('filter_1')
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_1']").innerHTML).toContain('10')
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_2']").innerHTML).toContain('filter_2')
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_2']").innerHTML).toContain('40')
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_3']").innerHTML).toContain('filter_3')
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_3']").innerHTML).toContain('30')
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_4']").innerHTML).toContain('filter_4')
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_4']").innerHTML).toContain('20')
    })

    it('should render checked filters', () => {
      const { node } = setup()
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_1']").getElementsByTagName('input')[ 0 ].checked).toBe(true)
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_2']").getElementsByTagName('input')[ 0 ].checked).toBe(false)
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_3']").getElementsByTagName('input')[ 0 ].checked).toBe(false)
      expect(node.querySelector("[data-automation-id='filter_test_aggregation_filter_4']").getElementsByTagName('input')[ 0 ].checked).toBe(true)
    })

    it('should order by count', () => {
      const { node } = setup()
      let nodes = node.querySelectorAll('[data-automation-id]')
      expect(nodes[ 0 ].getAttribute('data-automation-id')).toBe('filter_test_aggregation_filter_2')
      expect(nodes[ 1 ].getAttribute('data-automation-id')).toBe('filter_test_aggregation_filter_3')
      expect(nodes[ 2 ].getAttribute('data-automation-id')).toBe('filter_test_aggregation_filter_4')
      expect(nodes[ 3 ].getAttribute('data-automation-id')).toBe('filter_test_aggregation_filter_1')
    })
  })
})
