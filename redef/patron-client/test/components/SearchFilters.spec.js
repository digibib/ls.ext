/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilters, { __RewireAPI__ as DefaultExportSearchFiltersRewireApi } from '../../src/frontend/components/SearchFilters'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from '../../src/frontend/reducers'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    filters: [
      { id: 'prefix1_postfix1' },
      { id: 'prefix1_postfix2' },
      { id: 'prefix2_postfix1' },
      { id: 'prefix2_postfix1' }
    ],
    locationQuery: {},
    toggleFilter: () => {},
    toggleFilterVisibility: () => {},
    toggleAllFiltersVisibility: () => {},
    toggleCollapseFilter: () => {},
    togglePeriod: () => {},
    toggleAvailability: () => {},
    scrollTargetNode: {},
    windowWidth: 1000,
    ...propOverrides
  }

  const store = createStore(rootReducer)

  const messages = {
    'AvailableFilter.availability': 'Tilgjengelighet',
    'AvailableFilter.availabilityLabel': 'Inkludér kun tilgjengelige'
  }

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages}>
        <SearchFilters {...props} />
      </IntlProvider>
    </Provider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  before(() => {
    DefaultExportSearchFiltersRewireApi.__Rewire__('SearchFilter', React.createClass({
      render () {
        return (
          <div />
        )
      }
    }))
  })

  after(() => {
    DefaultExportSearchFiltersRewireApi.__ResetDependency__('SearchFilter')
  })

  describe('SearchFilters', () => {
    it('should render empty if no query in locationQuery', () => {
      const { node } = setup()
      expect(node.getAttribute('data-automation-id')).toBe('empty')
    })

    it('should render only one group if just one type of aggregation', () => {
      const { node } = setup({
        filters: [
          { id: 'prefix1_postfix1' },
          { id: 'prefix1_postfix2' }
        ],
        locationQuery: { query: 'test_query' },
        setFilter: () => {}
      })
      expect(node.querySelector("[data-automation-id='search_filters']").childNodes.length).toBe(4) // range and availability counts for 2
    })

    it('should render filters in groups', () => {
      const { node } = setup({ locationQuery: { query: 'test_query' } })
      expect(node.querySelector("[data-automation-id='search_filters']").childNodes.length).toBe(5) // range and availability counts for 2
    })
  })
})

