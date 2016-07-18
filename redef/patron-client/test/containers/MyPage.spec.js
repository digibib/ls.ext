/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import MyPage from '../../src/frontend/containers/MyPage'
import { shallow } from 'enzyme'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    ...propOverrides
  }

  const wrapper = shallow(
    <IntlProvider locale="en">
      <MyPage {...props}>
        <div data-automation-id="test-child" />
      </MyPage>
    </IntlProvider>
  )

  return {
    props: props,
    wrapper: wrapper
  }
}

describe('containers', () => {
  describe('MyPage', () => {
    it('should render child component', () => {
      const { wrapper } = setup()
      expect(wrapper.find("[data-automation-id='test-child']").length).toBe(1)
    })
  })
})
