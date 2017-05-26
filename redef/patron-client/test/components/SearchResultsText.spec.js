/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchResultsText from '../../src/frontend/components/SearchResultsText'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    locationQuery: {},
    totalHits: 0,
    totalHitsPublications: 0,
    isSearching: false,
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
      <SearchResultsText {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('SearchResultsText', () => {
    it('should render nothing if no search', () => {
      const { node } = setup()
      expect(node).toBe(null)
    })
    it('should render search term and total hits when display is large enough', () => {
      const { node, props } = setup({
        locationQuery: { query: 'test_query' },
        totalHits: 11,
        mediaQueryValues: { width: 668 }
      })
      expect(node.querySelector("[data-automation-id='current-search-term']").textContent).toEqual(props.locationQuery.query)
      expect(node.querySelector("[data-automation-id='hits-total']").textContent).toEqual(String(props.totalHits))
    })

    it('should should only render total hits on small screens', () => {
      const { node, props } = setup({
        locationQuery: { query: 'test_query' },
        totalHits: 11,
        mediaQueryValues: { width: 667 }
      })
      expect(node.querySelector("[data-automation-id='current-search-term']")).toBe(null)
      expect(node.querySelector("[data-automation-id='hits-total']").textContent).toEqual(String(props.totalHits))
    })
  })
})
