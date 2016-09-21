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
      { prefLabel: 'genre_1', genreSubdivision: 'x' },
      { prefLabel: 'genre_2', genreSubdivision: 'y' },
      { prefLabel: 'genre_3', genreSubdivision: 'z' }
    ],
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
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
    it('should render all genres', () => {
      const { node, props } = setup()
      const text = node.querySelector("[data-automation-id='work_genres']").textContent
      props.genres.forEach(genre => {
        expect(text).toContain(genre.prefLabel)
        expect(text).toContain(genre.genreSubdivision)
      })
    })
  })
})
