/* eslint-env mocha */
/* global findElementByDataAutomationId */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Footer from '../../src/frontend/components/Footer'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    loadLanguage: expect.createSpy(),
    locale: 'no',
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Footer {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Footer', () => {
    it('should change to English language when Norwegian language', () => {
      const { output, props } = setup()
      const changeLanguage = findElementByDataAutomationId(output, 'change_language_element')
      TestUtils.Simulate.click(changeLanguage)
      expect(props.loadLanguage).toHaveBeenCalled()
      expect(props.loadLanguage.calls[ 0 ].arguments[ 0 ]).toBe('en')
    })

    it('should change to Norwegian language when any other language set', () => {
      const { output, props } = setup({locale: 'dummy'})
      const changeLanguage = findElementByDataAutomationId(output, 'change_language_element')
      TestUtils.Simulate.click(changeLanguage)
      expect(props.loadLanguage).toHaveBeenCalled()
      expect(props.loadLanguage.calls[ 0 ].arguments[ 0 ]).toBe('no')
    })
  })
})
