/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import EditableField from '../../src/frontend/components/EditableField'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    'data-automation-id': 'test_daid',
    inputProps: {
      initialValue: 'testvalue',
      defaultValue: 'testvalue' /* defaultValue is to work around the field not being attacked to redux-form */
    },
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <EditableField {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('EditableField', () => {
    it('should render span when not editable', () => {
      const { node, props } = setup({editable: false})
      expect(node.tagName).toEqual('SPAN')
      expect(node.getAttribute('data-automation-id')).toEqual(props[ 'data-automation-id' ])
      expect(node.textContent).toEqual('testvalue')
    })

    it('should render input when editable', () => {
      const { node, props } = setup({ editable: true })
      expect(node.tagName).toEqual('INPUT')
      expect(node.getAttribute('data-automation-id')).toEqual(props[ 'data-automation-id' ])
      expect(node.value).toEqual(props.inputProps.defaultValue)
    })
  })
})
