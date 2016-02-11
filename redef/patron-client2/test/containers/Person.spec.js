import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import Person from '../../src/frontend/containers/Person'

function setup (propOverrides) {
  const props = Object.assign({
    // resourceActions: {getPersonResource: expect.createSpy()},
    // params: {id: 'test'},
    store: {
      getState: () => {
        return { resources: {} }
      }
    }
  }, propOverrides)

  const renderer = TestUtils.createRenderer()
  renderer.render(<Person {...props} />)
  const output = renderer.getRenderOutput()

  return {
    props: props,
    output: output
  }
}

describe('components', () => {
  describe('Person', () => {
    it('should render no person', () => {
      const { output } = setup()

    })

    /*
     it('should render container', () => {
     const { output } = setup()
     expect(output.type).toBe('footer')
     expect(output.props.className).toBe('footer')
     })

     it('should display active count when 0', () => {
     const { output } = setup({ activeCount: 0 })
     const [ count ] = output.props.children
     expect(getTextContent(count)).toBe('No items left')
     })

     it('should display active count when above 0', () => {
     const { output } = setup({ activeCount: 1 })
     const [ count ] = output.props.children
     expect(getTextContent(count)).toBe('1 item left')
     })

     it('should render filters', () => {
     const { output } = setup()
     const [ , filters ] = output.props.children
     expect(filters.type).toBe('ul')
     expect(filters.props.className).toBe('filters')
     expect(filters.props.children.length).toBe(3)
     filters.props.children.forEach(function checkFilter(filter, i) {
     expect(filter.type).toBe('li')
     const a = filter.props.children
     expect(a.props.className).toBe(i === 0 ? 'selected' : '')
     expect(a.props.children).toBe({
     0: 'All',
     1: 'Active',
     2: 'Completed'
     }[i])
     })
     })

     it('should call onShow when a filter is clicked', () => {
     const { output, props } = setup()
     const [ , filters ] = output.props.children
     const filterLink = filters.props.children[1].props.children
     filterLink.props.onClick({})
     expect(props.onShow).toHaveBeenCalledWith(SHOW_ACTIVE)
     })

     it('shouldnt show clear button when no completed todos', () => {
     const { output } = setup({ completedCount: 0 })
     const [ , , clear ] = output.props.children
     expect(clear).toBe(undefined)
     })

     it('should render clear button when completed todos', () => {
     const { output } = setup({ completedCount: 1 })
     const [ , , clear ] = output.props.children
     expect(clear.type).toBe('button')
     expect(clear.props.children).toBe('Clear completed')
     })

     it('should call onClearCompleted on clear button click', () => {
     const { output, props } = setup({ completedCount: 1 })
     const [ , , clear ] = output.props.children
     clear.props.onClick({})
     expect(props.onClearCompleted).toHaveBeenCalled()
     })*/
  })
})
