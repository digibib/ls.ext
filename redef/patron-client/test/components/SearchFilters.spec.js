import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilters from '../../src/frontend/components/SearchFilters'
import ReactDOM from 'react-dom'

function setup (propOverrides) {
  const props = Object.assign({
    filters: [
      { aggregation: 'work.publication.language', bucket: 'filter_1', count: '10' },
      { aggregation: 'work.publication.language', bucket: 'filter_2', count: '40' },
      { aggregation: 'work.publication.format', bucket: 'filter_3', count: '30' },
      { aggregation: 'work.publication.format', bucket: 'filter_4', count: '20' }
    ],
    locationQuery: {},
    dispatch: () => {}
  }, propOverrides)

  const output = TestUtils.renderIntoDocument(
    <SearchFilters {...props} />
  );

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('SearchFilter', () => {
    it('should render empty if no query in locationQuery', () => {
      const { node } = setup()
      expect(node.getAttribute('data-automation-id')).toBe('empty')
    })

    it('should render only one group if just one type of aggregation', () => {
      const {node, props} = setup({
        filters: [
          { aggregation: 'work.publication.language', bucket: 'filter_1', count: '10' },
          { aggregation: 'work.publication.language', bucket: 'filter_2', count: '40' }
        ],
        locationQuery: { query: 'test_query' }
      })
      expect(node.querySelector("[data-automation-id='search_filters']").childNodes.length).toBe(1)
    })

    it('should render filters in groups', () => {
      const { node, props } = setup({ locationQuery: { query: 'test_query' } })
      expect(node.querySelector("[data-automation-id='search_filters']").childNodes.length).toBe(2)
    })
  })
})
