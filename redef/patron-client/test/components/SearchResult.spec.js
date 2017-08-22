/* eslint-env mocha */
import expect from 'expect'
import React, {PropTypes} from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import {IntlProvider} from 'react-intl'
import SearchResult, {__RewireAPI__ as DefaultExportSearchResultRewireApi} from '../../src/frontend/components/SearchResult'
import {Provider} from 'react-redux'
import rootReducer from '../../src/frontend/reducers'
import {createStore} from 'redux'

function setup (resultPropOverrides) {
  const props = {
    showStatus: () => {},
    locationQuery: { showStatus: 'test_relativeUri' },
    result: {
      mediaTypes: [],
      displayTitle: 'test_mainTitle',
      publication: {
        mainTitle: 'test_mainTitle',
        originalTitle: 'test_originalTitle',
        contributors: [ {
          role: 'author',
          agent: {
            name: 'test_creator_name',
            relativeUri: 'test_creator_relativeUri'
          }
        } ]
      },
      relativeUri: 'test_relativeUri',
      ...resultPropOverrides
    },
    resources: {},
    items: {},
    showBranchStatusMedia: () => {},
    showUnfilteredStatus: () => {},
    showBranchStatus: () => {},
    fetchWorkResource: () => {}
  }

  const store = createStore(rootReducer, { modal: props })

  const messages = {
    format_1: 'format_1',
    format_2: 'format_2',
    format_3: 'format_3',
    author: 'author',
    illustrator: 'illustrator'
  }
  const output = TestUtils.renderIntoDocument(
    <Provider store={store} >
      <IntlProvider locale="en" messages={messages} >
        <SearchResult {...props} />
      </IntlProvider>
    </Provider>
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
          <a href={this.props.to} >{this.props.children}</a>
        )
      }
    }))
  })

  after(() => {
    DefaultExportSearchResultRewireApi.__ResetDependency__('Link')
  })

  describe('SearchResult', () => {
    /*
     it('should render the result', () => {
     const { node, props } = setup()
     expect(node.querySelector("[data-automation-id='work-title']").textContent).toBe(props.result.displayTitle)
     expect(node.querySelector("[data-automation-id='work_originaltitle']").textContent).toBe(`Original title: ${props.result.publication.originalTitle}`)
     expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.publication.contributors[ 0 ].agent.name)
     expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.publication.contributors[ 0 ].agent.relativeUri)
     })
     */

    it('should render multiple contributors', () => {
      const { node, props } = setup({
        formats: [],
        contributors: [
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
      expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.contributors[ 0 ].agent.name)
      // expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.publication.contributors[ 0 ].agent.relativeUri)
      expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.contributors[ 1 ].agent.name)
      // expect(node.querySelector("[data-automation-id='work_contributors']").innerHTML).toContain(props.result.publication.contributors[ 1 ].agent.relativeUri)
    })

    it('should render formats', () => {
      const { node, props } = setup({
        formats: [ 'format_1', 'format_2', 'format_3' ], contributors: []
      })

      // TODO: Change back when search results render formats again
      /* expect(node.querySelector("[data-automation-id='work_formats']").innerHTML) */
      expect(node.getAttribute('data-formats'))
        .toContain(props.result.formats.join(', '))
    })
  })
})
