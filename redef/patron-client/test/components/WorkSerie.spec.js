/* eslint-env mocha */
// Test of shallow rendering, without any supporting libraries.
import expect from 'expect'
import React, { PropTypes } from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import WorkSerie, { __RewireAPI__ as DefaultExportWorkRelationsRewireApi } from '../../src/frontend/components/work/fields/WorkSerie'

function setup (propOverrides) {
  const props = { ...propOverrides }

  const messages = {
    labelWorkSerie: {
      id: 'WorkSerie.labelWorkSerie',
      description: 'Label for work serie',
      defaultMessage: 'A part of serie'
    }
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en" messages={messages}>
      <WorkSerie {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('WorkSerie', () => {
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

    it('should render one work serie', () => {
      const { node } = setup({
        workserie: {
          mainTitle: 'mainTitle',
          relativeUri: 'relativeUri'
        }
      })

      const link = node.querySelector("[data-automation-id='work_series_link']")
      expect(link.textContent).toBe('mainTitle')
      expect(link.getAttribute('href')).toBe('/search?query=series%3A%22mainTitle%22')
    })
  })
})
