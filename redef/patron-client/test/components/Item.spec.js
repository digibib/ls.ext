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

  const messages = {
    'test_media_type': 'test_media_type_english'
  }

  const Wrapper = React.createClass({
    propTypes: {
      children: PropTypes.element.isRequired
    },
    render: function () {
      return (
        <div>
          <div>{this.props.children}</div>
        </div>
      )
    }
  })

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
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
          shelfmark: 'shelfmark',
          total: 1,
          available: 0,
          languages: [],
          mediaTypes: ['test_media_type']
        }
      })

      // expect(node.querySelector("[data-automation-id='item_media_type']").textContent).toBe('test_media_type_english')
      expect(node.querySelector("[data-automation-id='item_languages']").textContent).toBe('')
      expect(node.querySelector("[data-automation-id='item_shelfmark']").textContent).toBe(props.item.shelfmark)
      expect(node.querySelector("[data-automation-id='item_status']").textContent).toBe('0 ledige av 1')
    })
  })
})
