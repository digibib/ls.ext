/* eslint-env mocha */
/* global findElementByDataAutomationId */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import { Login } from '../../src/frontend/containers/Login'
import * as types from '../../src/frontend/constants/ActionTypes'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    dispatch: expect.createSpy(),
    isLoggedIn: false,
    loginActions: { login: expect.createSpy() },
    modalActions: {},
    isRequestingLogin: false,
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale='en'>
      <Login {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('containers', () => {
  describe('Login', () => {
    it('should hide if already logged in', () => {
      const { props } = setup({ isLoggedIn: true })
      expect(props.dispatch).toHaveBeenCalled()
      expect(props.dispatch.calls[ 0 ].arguments[ 0 ].type).toEqual(types.HIDE_MODAL)
    })

    it('should trigger supplied success action if already logged in', () => {
      const { props } = setup({ isLoggedIn: true, successAction: { type: 'TEST_ACTION' } })
      expect(props.dispatch).toHaveBeenCalled()
      expect(props.dispatch.calls[ 0 ].arguments[ 0 ].type).toEqual('TEST_ACTION')
    })

    it('should render error message', () => {
      const { node } = setup({ loginError: 'error_message' })
      expect(node.querySelectorAll("[data-automation-id='login_error_message']").length).toBe(1)
    })

    it('should call login action when login button is clicked', () => {
      const { output, props } = setup()
      const [usernameInput, passwordInput] = TestUtils.scryRenderedDOMComponentsWithTag(output, 'input')
      ReactDOM.findDOMNode(usernameInput).value = 'testuser'
      ReactDOM.findDOMNode(passwordInput).value = 'testpassword'
      const loginButton = findElementByDataAutomationId(output, 'login_button')
      TestUtils.Simulate.click(loginButton)
      expect(props.loginActions.login).toHaveBeenCalled()
      expect(props.loginActions.login.calls[ 0 ].arguments).toEqual([ 'testuser', 'testpassword', { type: 'HIDE_MODAL' } ])
    })

    it('should pass supplied success action to login action when login button is clicked', () => {
      const { output, props } = setup({ successAction: { type: 'TEST_ACTION' } })
      const [usernameInput, passwordInput] = TestUtils.scryRenderedDOMComponentsWithTag(output, 'input')
      ReactDOM.findDOMNode(usernameInput).value = 'testuser'
      ReactDOM.findDOMNode(passwordInput).value = 'testpassword'
      const loginButton = findElementByDataAutomationId(output, 'login_button')
      TestUtils.Simulate.click(loginButton)
      expect(props.loginActions.login).toHaveBeenCalled()
      expect(props.loginActions.login.calls[ 0 ].arguments).toEqual([ 'testuser', 'testpassword', { type: 'TEST_ACTION' } ])
    })
  })
})
