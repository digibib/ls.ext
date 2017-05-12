/* eslint-env mocha */
/* global findElementByDataAutomationId */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchHeader, { __RewireAPI__ as DefaultExportSearchHeaderRewireApi } from '../../src/frontend/components/SearchHeader'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    locale: 'no',
    dispatch: expect.createSpy(),
    locationQuery: {},
    totalHits: 0,
    isLoggedIn: false,
    logout: () => {},
    showLoginDialog: () => {},
    requireLoginBeforeAction: () => {},
    showMobileNavigation: false,
    startRegistration: () => {},
    mobileNavigationActions: {
      showMobileNavigation: () => {},
      hideMobileNavigation: () => {}
    },
    searchActions: {
      search: () => {}
    },
    isSearching: false,
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
      <SearchHeader {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  before(() => {
    DefaultExportSearchHeaderRewireApi.__Rewire__('Link', () => <div />)
  })

  after(() => {
    DefaultExportSearchHeaderRewireApi.__ResetDependency__('Link')
  })

  describe('SearchHeader', () => {
    it('should search initial value from locationQuery', () => {
      const { output, props } = setup({ locationQuery: { query: 'testvalue' } })
      const searchButton = findElementByDataAutomationId(output, 'search_button')
      TestUtils.Simulate.click(searchButton)
      expect(props.dispatch).toHaveBeenCalled()
      expect(props.dispatch.calls[ 0 ].arguments[ 0 ].payload.args[ 0 ]).toEqual({
        pathname: '/search',
        query: { query: 'testvalue' }
      })
    })

    it('should search with value set from input', () => {
      const { output, props } = setup()
      const searchInput = TestUtils.findRenderedDOMComponentWithTag(output, 'input')
      ReactDOM.findDOMNode(searchInput).value = 'testvalue'
      const searchButton = findElementByDataAutomationId(output, 'search_button')
      TestUtils.Simulate.click(searchButton)
      expect(props.dispatch).toHaveBeenCalled()
      expect(props.dispatch.calls[ 0 ].arguments[ 0 ].payload.args[ 0 ]).toEqual({
        pathname: '/search',
        query: { query: 'testvalue' }
      })
    })

    it('should show logged in username on desktop', () => {
      const { node } = setup({ mediaQueryValues: { width: 992 }, borrowerName: 'test_borrowerName' })
      expect(node.querySelector("[data-automation-id='borrowerName']").textContent).toEqual('test_borrowerName')
    })

    it('should not show logged in user field when not logged in on desktop', () => {
      const { node } = setup({ mediaQueryValues: { width: 992 } })
      expect(node.querySelector("[data-automation-id='borrowerName']")).toEqual(undefined)
    })

    it('should show logged in username on mobile', () => {
      const { node } = setup({ mediaQueryValues: { width: 600 }, borrowerName: 'test_borrowerName' })
      expect(node.querySelector("[data-automation-id='borrowerName']").textContent).toEqual('test_borrowerName')
    })

    it('should not show logged in user field when not logged in on mobile', () => {
      const { node } = setup({ mediaQueryValues: { width: 600 } })
      expect(node.querySelector("[data-automation-id='borrowerName']")).toEqual(undefined)
    })
  })
})
