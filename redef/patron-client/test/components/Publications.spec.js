import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Publications from '../../src/frontend/components/Publications'
import ReactDOM from 'react-dom'

function setup (propOverrides) {
  const props = Object.assign({
    publications: [
      {
        id: 'test_id1',
        mainTitle: 'test_maintitle1',
        publicationYear: 'test_publicationYear1',
        language: 'test_language1',
        format: 'test_format1',
        itemsCount: 'test_itemsCount1'
      }, {
        id: 'test_id2',
        mainTitle: 'test_maintitle2',
        publicationYear: 'test_publicationYear2',
        language: 'test_language2',
        format: 'test_format2',
        itemsCount: 'test_itemsCount2'
      }, {
        id: 'test_id3',
        mainTitle: 'test_maintitle3',
        publicationYear: 'test_publicationYear3',
        language: 'test_language3',
        format: 'test_format3',
        itemsCount: 'test_itemsCount3'
      }
    ]
  }, propOverrides)

  const output = TestUtils.renderIntoDocument(
    <Publications {...props} />
  );

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('Publications', () => {
    it('should render empty when no publications', () => {
      const { node, props } = setup({ publications: [] })
      expect(node.querySelectorAll("[data-automation-id='no_publications']").length).toBe(1)
    })

    it('should render table rows for every result', () => {
      const { node, props } = setup()
      expect(node.querySelectorAll("[data-automation-id='publications'] tbody tr").length).toBe(3)
    })
  })
})
