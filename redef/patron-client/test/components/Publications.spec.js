import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Publications from '../../src/frontend/components/Publications'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    publications: [
      { id: 'publication_id1' }, { id: 'publication_id2' }, { id: 'publication_id3' }
    ], ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Publications {...props} />
    </IntlProvider>
  );

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Publications', () => {
    it('should render empty when no publications', () => {
      const { node, props } = setup({ publications: [] })
      expect(node.querySelectorAll("[data-automation-id='no_publications']").length).toBe(1)
    })

    it('should render table rows for every result', () => {
      const { node, props } = setup()
      expect(node.querySelector("[data-automation-id='publications']").childNodes.length).toBe(3)
    })
  })
})
