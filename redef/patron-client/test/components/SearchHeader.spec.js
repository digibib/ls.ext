import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchHeader from '../../src/frontend/components/SearchHeader'
import ReactDOM from 'react-dom'
import StubContext from 'react-stub-context'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    dispatch: expect.createSpy(),
    locationQuery: {},
    ...propOverrides
  }

  let StubbedSearchHeader = StubContext(SearchHeader, {
    router: {
      createPath: arg => `testprefix_${arg.query.query}`,
      createHref: () => {}
    }
  })
  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <StubbedSearchHeader {...props} />
    </IntlProvider>
  );

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('SearchHeader', () => {
    it('should search initial value from locationQuery', () => {
      const { output,props } = setup({ locationQuery: { query: 'testvalue' } })
      let searchButton = TestUtils.findRenderedDOMComponentWithTag(output, 'form')
      TestUtils.Simulate.submit(searchButton)
      expect(props.dispatch).toHaveBeenCalled()
      expect(props.dispatch.calls[ 0 ].arguments[ 0 ].payload.args).toEqual([ 'testprefix_testvalue' ])
    })
    it('should search with value set from input', () => {
      const { output,props } = setup()
      let searchInput = TestUtils.findRenderedDOMComponentWithTag(output, 'input')
      TestUtils.Simulate.change(searchInput, { target: { value: 'testvalue' } })
      let searchButton = TestUtils.findRenderedDOMComponentWithTag(output, 'form')
      TestUtils.Simulate.submit(searchButton)
      expect(props.dispatch).toHaveBeenCalled()
      expect(props.dispatch.calls[ 0 ].arguments[ 0 ].payload.args).toEqual([ 'testprefix_testvalue' ])
    })
  })
})
