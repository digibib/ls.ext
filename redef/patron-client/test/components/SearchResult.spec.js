/* eslint-env mocha */
import expect from 'expect'
import React, { PropTypes } from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import SearchResult, { __RewireAPI__ as DefaultExportSearchResultRewireApi } from '../../src/frontend/components/SearchResult'

function setup (resultPropOverrides) {
  const props = {
    result: {
      originalTitle: 'test_originalTitle',
      mainTitle: 'test_mainTitle',
      contributor: [ {
        role: 'author',
        agent: {
          name: 'test_creator_name',
          relativeUri: 'test_creator_relativeUri'
        }
      } ],
      relativeUri: 'test_relativeUri',
      ...resultPropOverrides
    }
  }

  const messages = {
    format_1: 'format_1',
    format_2: 'format_2',
    format_3: 'format_3',
    author: 'author',
    illustrator: 'illustrator'
  }
  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en' messages={messages}>
      <SearchResult {...props} />
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
    DefaultExportSearchResultRewireApi.__Rewire__('Link', React.createClass({
      propTypes: {
        to: PropTypes.string.isRequired,
        children: PropTypes.node
      },
      render () {
        return (
          <a href={this.props.to}>{this.props.children}</a>
        )
      }
    }))
  })

  after(() => {
    DefaultExportSearchResultRewireApi.__ResetDependency__
  })

  describe('SearchResult', () => {
    it('should render the result', () => {
      const { node, props } = setup()

      expect(node.querySelector("[data-automation-id='work-title']").textContent).toBe(props.result.mainTitle)
      expect(node.querySelector("[data-automation-id='work_originaltitle']").textContent.endsWith(props.result.originalTitle)).toBe(true)
      expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.contributor[ 0 ].agent.name)
      expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.contributor[ 0 ].agent.relativeUri)
    })

    it('should render part title and main title as title', () => {
      const { node, props } = setup({ partTitle: 'test_partTitle' })
      expect(node.querySelector("[data-automation-id='work-title']").textContent).toEqual(props.result.mainTitle + ' — ' + props.result.partTitle)
    })

    it('should render multiple contributors', () => {
      const { node, props } = setup({
        contributor: [
          {
            role: 'author',
            agent: {
              name: 'creator_1',
              relativeUri: 'relativeUri_1'
            }
          },
          {
            role: 'illustrator',
            agent: {
              name: 'creator_2',
              relativeUri: 'relativeUri_2'
            }
          }
        ]
      })
      expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.contributor[ 0 ].agent.name)
      expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.contributor[ 0 ].agent.relativeUri)
      expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.contributor[ 1 ].agent.name)
      expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.contributor[ 1 ].agent.relativeUri)
    })

    it('should render formats', () => {
      const { node, props } = setup({
        publications: [ { format: 'format_1' }, { format: 'format_2' }, { format: 'format_3' } ]
      })
      expect(node.querySelector("[data-automation-id='work_formats']").innerHTML)
        .toContain(props.result.publications[ 0 ].format + ', ' + props.result.publications[ 1 ].format + ', ' + props.result.publications[ 2 ].format)
    })
  })
})
