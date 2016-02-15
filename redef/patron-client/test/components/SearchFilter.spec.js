import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilter from '../../src/frontend/components/SearchFilter'
import ReactDOM from 'react-dom'

function setup (propOverrides) {
  const props = Object.assign({
    title: 'test_filter',
    filters: [
      { aggregation: 'work.language', bucket: 'filter_1', count: '10' },
      { aggregation: 'work.language', bucket: 'filter_2', count: '40' },
      { aggregation: 'work.language', bucket: 'filter_3', count: '30' },
      { aggregation: 'work.language', bucket: 'filter_4', count: '20' }
    ],
    locationQuery: {},
    dispatch: () => {}
  }, propOverrides)

  const output = TestUtils.renderIntoDocument(
    <SearchFilter {...props} />
  );

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
      const { node, props } = setup()
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_1']").innerHTML).toContain('filter_1')
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_1']").innerHTML).toContain('10')
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_2']").innerHTML).toContain('filter_2')
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_2']").innerHTML).toContain('40')
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_3']").innerHTML).toContain('filter_3')
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_3']").innerHTML).toContain('30')
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_4']").innerHTML).toContain('filter_4')
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_4']").innerHTML).toContain('20')
    })

    it('should render checked filters', () => {
      const {node, props } = setup({ locationQuery: { 'filter_work.language': [ 'filter_1', 'filter_4' ] } })
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_1']").getElementsByTagName('input')[ 0 ].checked).toBe(true)
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_2']").getElementsByTagName('input')[ 0 ].checked).toBe(false)
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_3']").getElementsByTagName('input')[ 0 ].checked).toBe(false)
      expect(node.querySelector("[data-automation-id='filter_work.language_filter_4']").getElementsByTagName('input')[ 0 ].checked).toBe(true)
    })

    it('should order by count', () => {
      const { node, props } = setup()
      let nodes = node.querySelectorAll('[data-automation-id]')
      expect(nodes[ 0 ].getAttribute('data-automation-id')).toBe('filter_work.language_filter_2')
      expect(nodes[ 1 ].getAttribute('data-automation-id')).toBe('filter_work.language_filter_3')
      expect(nodes[ 2 ].getAttribute('data-automation-id')).toBe('filter_work.language_filter_4')
      expect(nodes[ 3 ].getAttribute('data-automation-id')).toBe('filter_work.language_filter_1')
    })
  })
})
