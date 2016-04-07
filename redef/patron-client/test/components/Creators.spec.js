/* eslint-env mocha */
// Test of shallow rendering, without any supporting libraries.
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Creators from '../../src/frontend/components/Creators'

function setup (props) {
  let renderer = TestUtils.createRenderer()
  renderer.render(<Creators {...props} />)
  let output = renderer.getRenderOutput()

  return {
    props,
    output,
    renderer
  }
}

describe('components', () => {
  describe('Creators', () => {
    it('should render one creator', () => {
      const { output } = setup({
        creators: [
          { name: 'name', relativeUri: 'relativeUri' }
        ]
      })
      expect(output.type).toBe('h3')

      let [ Link ] = output.props.children
      expect(Link.type.displayName).toBe('Link')
      expect(Link.props.children).toBe('name')
      expect(Link.props.to).toBe('relativeUri')
    })

    it('should render multiple creators', () => {
      const { output } = setup({
        creators: [
          { name: 'first', relativeUri: 'firstUri' },
          { name: 'second', relativeUri: 'secondUri' },
          { name: 'third', relativeUri: 'thirdUri' }
        ]
      })
      expect(output.type).toBe('h3')

      let [ Link_1, Link_2, Link_3 ] = output.props.children

      expect(Link_1.type.displayName).toBe('Link')
      expect(Link_1.props.children).toBe('first')
      expect(Link_1.props.to).toBe('firstUri')

      expect(Link_2.type.displayName).toBe('Link')
      expect(Link_2.props.children).toBe('second')
      expect(Link_2.props.to).toBe('secondUri')

      expect(Link_3.type.displayName).toBe('Link')
      expect(Link_3.props.children).toBe('third')
      expect(Link_3.props.to).toBe('thirdUri')
    })
  })
})
