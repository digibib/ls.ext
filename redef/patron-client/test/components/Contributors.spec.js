/* eslint-env mocha */
// Test of shallow rendering, without any supporting libraries.
import expect from 'expect'
import React, { PropTypes } from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import Contributors, { __RewireAPI__ as DefaultExportContributorsRewireApi } from '../../src/frontend/components/work/fields/Contributors'

function setup (propOverrides) {
  const props = { ...propOverrides }

  const messages = {
    'http://data.deichman.no/role#author': 'author'
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
      <Contributors {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Contributors', () => {
    before(() => {
      DefaultExportContributorsRewireApi.__Rewire__('Link', React.createClass({
        propTypes: {
          to: PropTypes.string.isRequired,
          children: PropTypes.node
        },
        render () {
          return (
            <a href={this.props.to} {...this.props}>{this.props.children}</a>
          )
        }
      }))
    })

    after(() => {
      DefaultExportContributorsRewireApi.__ResetDependency__('Link')
    })

    it('should render one contributor', () => {
      const { node } = setup({
        contributors: {
          'http://data.deichman.no/role#author': [ { name: 'name', relativeUri: 'relativeUri' } ]
        }
      })

      const link = node.querySelector("[data-automation-id='work_contributor_link']")
      expect(link.textContent).toBe('name')
      expect(link.getAttribute('href')).toBe('/search?query=akt%C3%B8r%3A%22name%22')
    })

    it('should render multiple contributors', () => {
      const { node } = setup({
        contributors: {
          'http://data.deichman.no/role#author': [
            { name: 'first', relativeUri: 'firstUri' },
            { name: 'second', relativeUri: 'secondUri' },
            { name: 'third', relativeUri: 'thirdUri' }
          ]
        }
      })

      expect(node.querySelectorAll("[data-automation-id='work_contributor_link']").length).toBe(3)
    })
  })
})
