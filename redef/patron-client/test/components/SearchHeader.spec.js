import expect from 'expect'

import Test from 'legit-tests'

import React from 'react'
import ReactDOM from 'react-dom'
import TestUtils from 'react-addons-test-utils'
//import ShallowTestUtils from 'react-shallow-testutils';
import SearchHeader from '../../src/frontend/components/SearchHeader'
import stubContext from 'react-stub-context'
//var SearchHeader = require('../../src/frontend/components/SearchHeader').default
function noop () {}

function setup (propOverrides) {
  const props = Object.assign({
    dispatch: expect.createSpy(),
    locationQuery: 'test search'
  }, propOverrides)

  const renderer = TestUtils.createRenderer()
  renderer.render(<SearchHeader dispatch={expect.createSpy()} locationQuery={'loool'}/>)
  const output = renderer.getRenderOutput()

  return {
    props: props,
    output: output,
    renderer: renderer
  }
}

describe('components', () => {
  describe('SearchHeader', () => {
    it('should render component', () => {
      //const { output } = setup()
      //expect(output.type).toBe('header')
      //expect(output.props.className).toBe('row')
    })

    describe('perform search', () => {
      it('should search', () => {
        // const { renderer, output } = setup()

        const props = {
          dispatch: expect.createSpy(),
          locationQuery: {}
        }
        let Router = { createPath: noop, createHref: noop }
        let StubbedSearchHeader = stubContext(SearchHeader, { router: Router });
        var searchHeader = TestUtils.renderIntoDocument(
          <StubbedSearchHeader {...props} />
        );

        //const searchField = TestUtils.findRenderedDOMComponentWithTag(searchHeader, 'input')
        //ReactDOM.findDOMNode(searchField).value = 'tsnthnsthsnhnshsnshsnthsnthsnhtnsthsnthsnthnsthsnthest'

        const searchForm = TestUtils.findRenderedDOMComponentWithTag(searchHeader, 'form')
        TestUtils.Simulate.submit(searchForm)

        expect(props.dispatch).toHaveBeenCalled()
        //console.log(props.dispatch.mock.calls[ 0 ][ 0 ])

        const props2 = {
          dispatch: expect.createSpy(),
          locationQuery: {}
        }

        Test(<StubbedSearchHeader {...props2} />) //or shallow render Test(<Component/>, {shallow: true})
          .find('button')
          .simulate({ method: 'click', element: 'button' })
          .find('input')
          .simulate({ method: 'submit', element: 'input' })
          .test(() => {
            expect(props.dispatch).toHaveBeenCalled()
          })

      })
    })
  })
})

