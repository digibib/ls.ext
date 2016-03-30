/* global describe, it */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Items from '../../src/frontend/components/Items'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    items: [
      { barcode: 'item_barcode1' }, { barcode: 'item_barcode2' }, { barcode: 'item_barcode3' }
    ], ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Items {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Items', () => {
    it('should render empty when no items', () => {
      const { node } = setup({ items: [] })
      expect(node.querySelectorAll("[data-automation-id='no_items']").length).toBe(1)
    })

    it('should render table rows for every result', () => {
      const { node } = setup()
      expect(node.querySelector("[data-automation-id='work_items']").childNodes.length).toBe(3)
    })
  })
})
