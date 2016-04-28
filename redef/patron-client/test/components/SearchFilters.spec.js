/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilters from '../../src/frontend/components/SearchFilters'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    filters: [
      { aggregation: 'work.publication.languages', bucket: 'filter_1', count: '10' },
      { aggregation: 'work.publication.languages', bucket: 'filter_2', count: '40' },
      { aggregation: 'work.publication.formats', bucket: 'filter_3', count: '30' },
      { aggregation: 'work.publication.formats', bucket: 'filter_4', count: '20' }
    ],
    locationQuery: {},
    toggleFilter: () => {},
    toggleFilterVisibility: () => {},
    toggleAllFiltersVisibility: () => {},
    toggleCollapseFilter: () => {},
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
      <SearchFilters {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('SearchFilters', () => {
    it('should render empty if no query in locationQuery', () => {
      const { node } = setup()
      expect(node.getAttribute('data-automation-id')).toBe('empty')
    })

    it('should render only one group if just one type of aggregation', () => {
      const { node } = setup({
        filters: [
          { aggregation: 'work.publication.languages', bucket: 'filter_1', count: '10' },
          { aggregation: 'work.publication.languages', bucket: 'filter_2', count: '40' }
        ],
        locationQuery: { query: 'test_query' },
        setFilter: () => {}
      })
      expect(node.querySelector("[data-automation-id='search_filters']").childNodes.length).toBe(1)
    })

    it('should render filters in groups', () => {
      const { node } = setup({ locationQuery: { query: 'test_query' } })
      expect(node.querySelector("[data-automation-id='search_filters']").childNodes.length).toBe(2)
    })
  })
})
