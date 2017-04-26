/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchFilterBox from '../../src/frontend/components/SearchFilterBox'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    query: { back: 'search?filter=language_nob&filter=language_eng&filter=language_fin&filter=language_swe&query=donald&showMore=branch' },
    toggleFilter: () => {},
    toggleAvailability: () => {},
    removePeriod: () => {},
    titleText: 'dummyTitle',
    ...propOverrides
  }

  const messages = {
    'http://lexvo.org/id/iso639-3/nob': 'Norwegian',
    'http://lexvo.org/id/iso639-3/eng': 'English',
    'http://lexvo.org/id/iso639-3/fin': 'Finnish',
    'http://lexvo.org/id/iso639-3/swe': 'Swedish'
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
      <SearchFilterBox {...props} />
    </IntlProvider>)

  return {
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('SearchFilterBox', () => {
    it('should render empty if no filters', () => {
      const { node } = setup({ query: {test: 'invalid_query'} })
      expect(node).toBe(null)
    })

    it('should render filters', () => {
      const { node } = setup()
      // TODO Uncomment count checks when the count received from elastic search is correct
      expect(node.querySelector("[data-automation-id='language_nob']").innerHTML).toContain('Norwegian')
      expect(node.querySelector("[data-automation-id='language_eng']").innerHTML).toContain('English')
      expect(node.querySelector("[data-automation-id='language_fin']").innerHTML).toContain('Finnish')
      expect(node.querySelector("[data-automation-id='language_swe']").innerHTML).toContain('Swedish')
    })
  })
})
