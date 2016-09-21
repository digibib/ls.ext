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
      { prefLabel: 'subject_1', specification: 'x' },
      { prefLabel: 'subject_2', specification: 'y' },
      { prefLabel: 'subject_3', specification: 'z' }
    ],
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
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
    it('should render all subjects', () => {
      const { node, props } = setup()
      const text = node.querySelector("[data-automation-id='work_subjects']").textContent
      props.subjects.forEach(genre => {
        expect(text).toContain(genre.prefLabel)
        expect(text).toContain(genre.specification)
      })
    })
  })
})
