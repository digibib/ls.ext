/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import Subjects from '../../src/frontend/components/Subjects'

function setup (propOverrides) {
  const props = {
    subjects: [
      { name: 'subject_1', relativeUri: 'relativeUri_1' },
      { name: 'subject_2', relativeUri: 'relativeUri_2' },
      { name: 'subject_3', relativeUri: 'relativeUri_3' }
    ], ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Subjects {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Subjects', () => {
    it('should render spans for every subject', () => {
      const { node } = setup()
      expect(node.querySelectorAll("[data-automation-id='work_subject']").length).toBe(3)
    })
  })
})
