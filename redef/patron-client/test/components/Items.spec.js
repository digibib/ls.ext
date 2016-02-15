import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Items from '../../src/frontend/components/Items'
import ReactDOM from 'react-dom'

function setup (propOverrides) {
  const props = Object.assign({
    items: [
      { barcode: 'item_barcode1' }, { barcode: 'item_barcode2' }, { barcode: 'item_barcode3' }
    ]
  }, propOverrides)

  const output = TestUtils.renderIntoDocument(
    <Items {...props} />
  );

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Items', () => {
    it('should render empty when no items', () => {
      const { node, props } = setup({ items: [] })
      expect(node.querySelectorAll("[data-automation-id='no_items']").length).toBe(1)
    })

    it('should render table rows for every result', () => {
      const { node, props } = setup()
      expect(node.querySelector("[data-automation-id='work_items']").childNodes.length).toBe(3)
    })
  })
})
