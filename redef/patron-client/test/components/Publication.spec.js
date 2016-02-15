import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Publication from '../../src/frontend/components/Publication'
import ReactDOM from 'react-dom'

function setup (propOverrides) {
  const props = Object.assign({
    publication: {
      id: 'test_id',
      mainTitle: 'test_maintitle',
      publicationYear: 'test_publicationYear',
      language: 'test_language',
      format: 'test_format',
      itemsCount: 'test_itemsCount'
    }
  }, propOverrides)

  const output = TestUtils.renderIntoDocument(
    <table><Publication {...props} /></table>
  );

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Publication', () => {
    it('should render', () => {
      const { output } = setup()
      expect(output.props.children.type.displayName).toBe('Publication')
    })

    it('should render the publication with title, year, language, format and item count', () => {
      const { node, props } = setup()
      expect(node.querySelector("[data-automation-id='publication_title']").innerHTML).toBe(props.publication.mainTitle)
      expect(node.querySelector("[data-automation-id='publication_year']").innerHTML).toBe(props.publication.publicationYear)
      expect(node.querySelector("[data-automation-id='publication_language']").innerHTML).toBe(props.publication.language)
      expect(node.querySelector("[data-automation-id='publication_format']").innerHTML).toBe(props.publication.format)
    })

    it('should combine main title and part title as title', () => {
      const { node, props } = setup({ publication: { mainTitle: 'test_maintitle', partTitle: 'test_parttitle' } })
      expect(node.querySelector("[data-automation-id='publication_title']").innerHTML).toBe(props.publication.mainTitle + ' - ' + props.publication.partTitle)
    })
  })
})
