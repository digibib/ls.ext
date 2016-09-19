/* eslint-env mocha */

import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import FormInputField from '../../src/frontend/components/FormInputField'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    name: 'test',
    type: 'text',
    message: {
      id: 'testMessage',
      description: '',
      defaultMessage: ''
    },
    getValidator: null,
    isLabelOverInput: 'isLabelOverInput',
    hasLabel: 'hasLabel',
    headerType: 'h2',
    formName: 'testForm',
    placeholder: null,
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
      <FormInputField {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('FormInputField', () => {
    it('', () => {

    })
  })
})

