/* eslint-env mocha */
/* global findElementByDataAutomationId */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import StubContext from 'react-stub-context'
import PublicationInfo, { __RewireAPI__ as DefaultExportPublicationInfoRewireApi } from '../../src/frontend/components/PublicationInfo'

function setup (propOverrides) {
  const props = {
    publication: {
      id: 'test_id',
      uri: 'test_uri'
    },
    expandSubResource: expect.createSpy(),
    ...propOverrides
  }

  let StubbedPublicationInfo = StubContext(PublicationInfo, {
    router: {
      createPath: arg => `testprefix_${arg.query.query}`,
      createHref: () => {}
    }
  })

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <StubbedPublicationInfo {...props} />
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
    DefaultExportPublicationInfoRewireApi.__Rewire__('Items', React.createClass({
      render () {
        return (
          <table />
        )
      }
    }))
  })

  after(() => {
    DefaultExportPublicationInfoRewireApi.__ResetDependency__
  })

  describe('PublicationInfo', () => {
    it('should send call to close panel when close element is clicked', () => {
      const { output, props } = setup()
      let closeButton = findElementByDataAutomationId(output, `close_publication_info_${props.publication.uri}`)
      TestUtils.Simulate.click(closeButton)
      expect(props.expandSubResource).toHaveBeenCalled()
      expect(props.expandSubResource.calls[ 0 ].arguments[ 0 ]).toBe(null)
    })
  })
})
