/* global before, after, describe, it */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import PublicationInfo, { __RewireAPI__ as DefaultExportPublicationInfoRewireApi } from '../../src/frontend/components/PublicationInfo'

function setup (propOverrides) {
  const props = { ...propOverrides }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <PublicationInfo {...props} />
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
    DefaultExportItemsRewireApi.__ResetDependency__
  })

  describe('PublicationInfo', () => {
    it('should xxx when yyy', () => {
      const { node } = setup({ items: [] })
      //expect(node.querySelectorAll("[data-automation-id='no_items']").length).toBe(1)
    })
  })
})
