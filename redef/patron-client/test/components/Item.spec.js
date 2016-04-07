/* eslint-env mocha */
import expect from 'expect'
import React, { PropTypes } from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import Item from '../../src/frontend/components/Item'

function setup (propOverrides) {
  const props = {
    ...propOverrides
  }

  const Wrapper = React.createClass({
    propTypes: {
      children: PropTypes.element.isRequired
    },
    render: function () {
      return (
        <table>
          <tbody>{this.props.children}</tbody>
        </table>
      )
    }
  })

  const messages = {
    'format': 'format_english',
    'language': 'language_english'
  }
  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en' messages={messages}>
      <Wrapper><Item {...props} /></Wrapper>
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Item', () => {
    it('should render one unavailable item', () => {
      const { node, props } = setup({
        item: {
          title: 'title',
          language: 'language',
          format: 'format',
          barcode: 'barcode',
          location: 'location',
          status: '01.01.2020',
          shelfmark: 'shelfmark'
        }
      })

      expect(node.querySelector("[data-automation-id='item_title']").textContent).toBe(props.item.title)
      expect(node.querySelector("[data-automation-id='item_language']").textContent).toBe(`${props.item.language}_english`)
      expect(node.querySelector("[data-automation-id='item_format']").textContent).toBe(`${props.item.format}_english`)
      expect(node.querySelector("[data-automation-id='item_barcode']").textContent).toBe(props.item.barcode)
      expect(node.querySelector("[data-automation-id='item_location']").textContent).toBe(props.item.location)
      expect(node.querySelector("[data-automation-id='item_status']").textContent).toBe(`Expected ${props.item.status}`)
      expect(node.querySelector("[data-automation-id='item_shelfmark']").textContent).toBe(props.item.shelfmark)
    })

    it('should render one available item', () => {
      const { node, props } = setup({
        item: {
          title: 'title',
          language: 'language',
          format: 'format',
          barcode: 'barcode',
          location: 'location',
          status: 'AVAIL',
          shelfmark: 'shelfmark'
        }
      })

      expect(node.querySelector("[data-automation-id='item_title']").textContent).toBe(props.item.title)
      expect(node.querySelector("[data-automation-id='item_language']").textContent).toBe(`${props.item.language}_english`)
      expect(node.querySelector("[data-automation-id='item_format']").textContent).toBe(`${props.item.format}_english`)
      expect(node.querySelector("[data-automation-id='item_barcode']").textContent).toBe(props.item.barcode)
      expect(node.querySelector("[data-automation-id='item_location']").textContent).toBe(props.item.location)
      expect(node.querySelector("[data-automation-id='item_status']").textContent).toBe('Available')
      expect(node.querySelector("[data-automation-id='item_shelfmark']").textContent).toBe(props.item.shelfmark)
    })
  })
})
