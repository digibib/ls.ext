/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Publications, { __RewireAPI__ as DefaultExportPublicationsRewireApi } from '../../src/frontend/components/Publications'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    expandSubResource: () => {},
    startReservation: () => {},
    locationQuery: {},
    publications: [
      { uri: '/publication_id1', id: 'publication_id1' },
      { uri: '/publication_id2', id: 'publication_id2' },
      { uri: '/publication_id3', id: 'publication_id3' },
      { uri: '/publication_id4', id: 'publication_id4' }
    ], ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Publications {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  before(() => {
    DefaultExportPublicationsRewireApi.__Rewire__('Publication', React.createClass({
      render () {
        return (
          <div className='publication' />
        )
      }
    }))
  })

  after(() => {
    DefaultExportPublicationsRewireApi.__ResetDependency__
  })

  describe('Publications', () => {
    it('should render empty when no publications', () => {
      const { node } = setup({ publications: [] })
      expect(node.querySelectorAll("[data-automation-id='no_publications']").length).toBe(1)
    })

    it('should render publications', () => {
      const { node } = setup()
      expect(node.getElementsByClassName('publication').length).toBe(4)
    })

    it('should render row for every three publications', () => {
      const { node } = setup()
      expect(node.getElementsByClassName('row').length).toBe(2)
    })
  })
})
