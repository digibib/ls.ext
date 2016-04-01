/* global describe, it */
import expect from 'expect'
import React, { PropTypes } from 'react'
import TestUtils from 'react-addons-test-utils'
import ReactDOM from 'react-dom'
import Publication from '../../src/frontend/components/Publication'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    publication: {
      id: 'test_id',
      mainTitle: 'test_maintitle',
      publicationYear: 'test_publicationYear',
      language: 'test_language',
      format: 'test_format',
      itemsCount: 'test_itemsCount'
    }, ...propOverrides
  }

  const Wrapper = React.createClass({
    propTypes: {
      children: PropTypes.element.isRequired
    },
    render: function () {
      return (
        <table>
          <tbody>{this.props.children}</tbody>
        </table>
      )
    }
  })

  const messages = {
    'test_format': 'test_format_english',
    'test_language': 'test_language_english'
  }
  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en' messages={messages}>
      <Wrapper><Publication {...props} /></Wrapper>
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Publication', () => {
    it('should render the publication with title, year, language, format and item count', () => {
      const { node, props } = setup()
      expect(node.querySelector("[data-automation-id='publication_title']").textContent).toBe(props.publication.mainTitle)
      expect(node.querySelector("[data-automation-id='publication_year']").textContent).toBe(props.publication.publicationYear)
      expect(node.querySelector("[data-automation-id='publication_language']").textContent).toBe(`${props.publication.language}_english`)
      expect(node.querySelector("[data-automation-id='publication_format']").textContent).toBe(`${props.publication.format}_english`)
    })

    it('should combine main title and part title as title', () => {
      const { node, props } = setup({ publication: { mainTitle: 'test_maintitle', partTitle: 'test_parttitle' } })
      expect(node.querySelector("[data-automation-id='publication_title']").textContent).toBe(props.publication.mainTitle + ' — ' + props.publication.partTitle)
    })
  })
})
