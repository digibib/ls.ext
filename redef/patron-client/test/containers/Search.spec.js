/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import {Search} from '../../src/frontend/containers/Search'
import Constants from '../../src/frontend/constants/Constants'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { createStore } from 'redux'
import rootReducer from '../../src/frontend/reducers'
import {IntlProvider} from 'react-intl'

function setup (propOverrides) {
  const props = {
    searchActions: {
      search: expect.createSpy(),
      enableSearchBar: () => {}
    },
    searchResults: [],
    isSearching: false,
    dispatch: () => {},
    searchError: false,
    filters: [],
    location: { query: {} },
    locationQuery: {},
    totalHits: 0,
    totalHitsPublications: 0,
    searchFilterActions: {
      toggleFilter: () => {},
      toggleFilterVisibility: () => {},
      toggleAllFiltersVisibility: () => {},
      toggleAvailability: () => {},
      toggleCollapseFilter: () => {},
      toggleHideNoItems: () => {},
      removePeriod: () => {},
      togglePeriod: () => {}
    },
    resourceActions: {
      fetchWorkResource: () => {}
    },
    resources: {},
    items: {},
    windowWidth: 1000,
    userProfile: { personalInformation: 'hutl' },
    path: 'test-path',
    ...propOverrides
  }

  const store = createStore(rootReducer)

  const messages = {
    'AvailableFilter.availability': 'Tilgjengelighet',
    'AvailableFilter.availabilityLabel': 'Inkludér kun tilgjengelige',
    'NoItemsFilter.label': 'Vis kun treff med eksemplarer'
  }

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages}>
        <Search {...props} />
      </IntlProvider>
    </Provider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('containers', () => {
  describe('Search', () => {
    it('should not render pagination when few results', () => {
      const { node } = setup({ location: { query: { query: 'test' } }, totalHits: Constants.maxSearchResultsPerPage })
      expect(node.querySelectorAll("[data-automation-id='search-results-pagination']").length).toBe(0)
    })

    it('should render pagination when many results', () => {
      const { node } = setup({
        location: { query: { query: 'test' } },
        totalHits: Constants.maxSearchResultsPerPage + 1
      })
      expect(node.querySelectorAll("[data-automation-id='search-results-pagination']").length).toBe(1)
    })

    it('should render links to pages', () => {
      const { node } = setup({
        location: { query: { query: 'test' } },
        totalHits: Constants.maxSearchResultsPerPage * 3
      })
      expect(node.querySelector("[data-automation-id='search-results-pagination']")
        .getElementsByClassName('pagination')[ 0 ].children.length).toBe(4) // including next and prev
    })
  })
})
