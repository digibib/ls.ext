import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchResult from '../../src/frontend/components/SearchResult'
import ReactDOM from 'react-dom'

function setup (resultPropOverrides) {
  const props = {
    result: Object.assign({
      originalTitle: 'test_originalTitle',
      mainTitle: 'test_mainTitle',
      creators: [ {
        name: 'test_creator_name',
        relativeUri: 'test_creator_relativeUri'
      } ],
      relativeUri: 'test_relativeUri'
    }, resultPropOverrides)
  }
  const output = TestUtils.renderIntoDocument(
    <SearchResult {...props} />
  );

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('components', () => {
  describe('SearchResult', () => {
    it('should render the result', () => {
      const { node, props } = setup()

      expect(node.querySelector("[data-automation-id='work-title']").textContent).toBe(props.result.mainTitle)
      expect(node.querySelector("[data-automation-id='work_originaltitle']").textContent.endsWith(props.result.originalTitle)).toBe(true)
      expect(node.querySelector("[data-automation-id='work_creators']").innerHTML).toContain(props.result.creators[ 0 ].name)
      expect(node.querySelector("[data-automation-id='work_creators']").innerHTML).toContain(props.result.creators[ 0 ].relativeUri)
    })

    it('should render part title and main title as title', () => {
      const { node, props } = setup({ partTitle: 'test_partTitle' })
      expect(node.querySelector("[data-automation-id='work-title']").textContent).toEqual(props.result.mainTitle + ' — ' + props.result.partTitle)
    })

    it('should render multiple creators', () => {
      const { node, props } = setup({
        creators: [
          {
            name: 'creator_1',
            relativeUri: 'relativeUri_1'
          },
          {
            name: 'creator_2',
            relativeUri: 'relativeUri_2'
          }
        ]
      })
      expect(node.querySelector("[data-automation-id='work_creators']").innerHTML).toContain(props.result.creators[ 0 ].name)
      expect(node.querySelector("[data-automation-id='work_creators']").innerHTML).toContain(props.result.creators[ 0 ].relativeUri)
      expect(node.querySelector("[data-automation-id='work_creators']").innerHTML).toContain(props.result.creators[ 1 ].name)
      expect(node.querySelector("[data-automation-id='work_creators']").innerHTML).toContain(props.result.creators[ 1 ].relativeUri)
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
