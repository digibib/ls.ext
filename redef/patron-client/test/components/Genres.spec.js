/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import Genres from '../../src/frontend/components/Genres'

function setup (propOverrides) {
  const props = {
    genres: [
      { name: 'genre_1', key: 'relativeUri_1' },
      { name: 'genre_2', key: 'relativeUri_2' },
      { name: 'genre_3', key: 'relativeUri_3' }
    ], ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Genres {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Genres', () => {
    it('should render spans for every genre', () => {
      const { node } = setup()
      expect(node.querySelectorAll("[data-automation-id='work_genre']").length).toBe(3)
    })
  })
})
