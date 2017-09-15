/* eslint-env mocha */
// Test of shallow rendering, without any supporting libraries.
import expect from 'expect'
import React, {PropTypes} from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import {IntlProvider} from 'react-intl'
import WorkRelations, {__RewireAPI__ as DefaultExportWorkRelationsRewireApi} from '../../src/frontend/components/work/fields/WorkRelations'

function setup (propOverrides) {
  const props = { ...propOverrides }

  const messages = {
    'http://data.deichman.no/relationType#basedOn': 'basedOn',
    'http://data.deichman.no/relationType#partOf': 'partOf',
    'http://data.deichman.no/relationType#relatedTo': 'relatedTo'
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
      <WorkRelations {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('WorkRelations', () => {
    before(() => {
      DefaultExportWorkRelationsRewireApi.__Rewire__('Link', React.createClass({
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
      DefaultExportWorkRelationsRewireApi.__ResetDependency__('Link')
    })

    it('should render one work relation', () => {
      const { node } = setup({
        workRelations: {
          'http://data.deichman.no/relationType#basedOn': [ { mainTitle: 'mainTitle', relativeUri: 'relativeUri' } ]
        }
      })

      const link = node.querySelector("[data-automation-id='work_relation_link']")
      expect(link.textContent).toBe('mainTitle')
      expect(link.getAttribute('href')).toBe('relativeUri')
    })

    it('should render multiple work relations', () => {
      const { node } = setup({
        workRelations: {
          'http://data.deichman.no/relationType#basedOn': [
            { name: 'first', relativeUri: 'firstUri' },
            { name: 'second', relativeUri: 'secondUri' },
            { name: 'third', relativeUri: 'thirdUri' }
          ]
        }
      })

      expect(node.querySelectorAll("[data-automation-id='work_relation_link']").length).toBe(3)
    })

    it('should render multiple work relations groups', () => {
      const { node } = setup({
        workRelations: {
          'http://data.deichman.no/relationType#basedOn': [
            { name: 'first', relativeUri: 'firstUri' },
            { name: 'second', relativeUri: 'secondUri' },
            { name: 'third', relativeUri: 'thirdUri' }
          ],
          'http://data.deichman.no/relationType#partOf': [
            { name: 'first', relativeUri: 'firstUri' },
            { name: 'second', relativeUri: 'secondUri' },
            { name: 'third', relativeUri: 'thirdUri' }
          ]
        }
      })

      expect(node.querySelectorAll("[data-automation-id='work_relations']").length).toBe(2)
    })

    it('should render a work relation with a main contributor', () => {
      const { node } = setup({
        workRelations: {
          'http://data.deichman.no/relationType#basedOn': [
            {
              mainTitle: 'mainTitle',
              relativeUri: 'relativeUri',
              contributors: [ {
                type: [ 'Contribution', 'MainEntry' ],
                agent: { name: 'mainContributor' }
              } ]
            }
          ]
        }
      })

      const link = node.querySelector("[data-automation-id='work_relation_link']")
      expect(link.textContent).toBe('mainTitle / mainContributor')
    })

    it('should render a relation to work series that alters the search', () => {
      const { node } = setup({
        workRelations: {
          'http://data.deichman.no/relationType#relatedTo': [
            {
              mainTitle: 'serialMainTitle',
              relativeUri: 'relativeUri',
              type: 'WorkSeries'
            }
          ]
        }
      })

      const link = node.querySelector("[data-automation-id='work_relation_link']")
      expect(link.textContent).toBe('serialMainTitle')
      expect(link.getAttribute('href')).toBe('/search?query=serie%3A%22serialMainTitle%22')
    })
  })
})
