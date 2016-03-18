import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import { Search } from '../../src/frontend/containers/Search'
import Constants from '../../src/frontend/constants/Constants'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    searchActions: { search: () => {} },
    searchResults: [],
    isSearching: false,
    dispatch: () => {},
    searchError: false,
    filters: [],
    location: { query: {} },
    locationQuery: {},
    totalHits: 0,
    searchFilterActions: { setFilter: () => {} },
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Search {...props} />
    </IntlProvider>
  );

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('containers', () => {
  describe('Search', () => {
    it('should not render pagination when few results', () => {
      const { node, props } = setup({ location: { query: { query: 'test' } }, totalHits: Constants.searchQuerySize })
      expect(node.querySelectorAll("[data-automation-id='search-results-pagination']").length).toBe(0)
    })
    it('should render pagination when many results', () => {
      const { node, props } = setup({
        location: { query: { query: 'test' } },
        totalHits: Constants.searchQuerySize + 1
      })
      expect(node.querySelectorAll("[data-automation-id='search-results-pagination']").length).toBe(2)
    })
    it('should render links to pages', () => {
      const { node, props } = setup({
        location: { query: { query: 'test' } },
        totalHits: Constants.searchQuerySize * 3
      })
      expect(node.querySelector("[data-automation-id='search-results-pagination']")
        .getElementsByClassName('pages')[ 0 ].children.length).toBe(3)
    })
  })
})
