import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import SearchHeader from '../../src/frontend/components/SearchHeader'

function setup (propOverrides) {
  const props = Object.assign({
    dispatch: expect.createSpy(),
    locationQuery: 'test search'
  }, propOverrides)

  const renderer = TestUtils.createRenderer()
  renderer.render(<SearchHeader {...props} />)
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
      const { output } = setup()
      expect(output.type).toBe('header')
      expect(output.props.className).toBe('row')
    })

    describe('perform search', () => {
      it('should search', () => {
        const { output } = setup()
        console.log(output.props.children)
        // TODO Actual test
      })
    })
  })
})

