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

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
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
          branch: 'branch',
          count: 'count',
          shelfmark: 'shelfmark',
          status: 'Utlånt'
        }
      })

      expect(node.querySelector("[data-automation-id='item_branch']").textContent).toBe(props.item.branch)
      expect(node.querySelector("[data-automation-id='item_count']").textContent).toBe(props.item.count)
      expect(node.querySelector("[data-automation-id='item_shelfmark']").textContent).toBe(props.item.shelfmark)
      expect(node.querySelector("[data-automation-id='item_status']").textContent).toBe(`${props.item.status}`)
    })

    it('should render one available item', () => {
      const { node, props } = setup({
        item: {
          branch: 'branch',
          count: 'count',
          shelfmark: 'shelfmark',
          status: 'Ledig'
        }
      })

      expect(node.querySelector("[data-automation-id='item_branch']").textContent).toBe(props.item.branch)
      expect(node.querySelector("[data-automation-id='item_count']").textContent).toBe(props.item.count)
      expect(node.querySelector("[data-automation-id='item_shelfmark']").textContent).toBe(props.item.shelfmark)
      expect(node.querySelector("[data-automation-id='item_status']").textContent).toBe('Ledig')
    })
  })
})
