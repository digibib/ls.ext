/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import UserInfoForm from '../../../src/frontend/containers/forms/UserInfoForm'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { createStore } from 'redux'
import rootReducer from '../../../src/frontend/reducers'
import { Provider } from 'react-redux'
import * as ProfileActions from '../../../src/frontend/actions/ProfileActions'

function setup (propOverrides) {
  const props = {
    location: { query: {} },
    ...propOverrides
  }

  const profileInformation = {
    address: 'address',
    zipcode: 'zipcode',
    city: 'city',
    country: 'country',
    mobile: 'mobile',
    email: 'email'
  }

  const store = createStore(rootReducer)
  store.dispatch(ProfileActions.receiveProfileInfo(profileInformation))

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en">
        <UserInfoForm {...props} />
      </IntlProvider>
    </Provider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output),
    store: store
  }
}

describe('containers', () => {
  describe('UserInfoForm', () => {
    it('should display values from store in editable fields', () => {
      const { node, store } = setup({ location: { query: { edit: null } } })
      const { personalInformation } = store.getState().profile
      Object.keys(personalInformation).forEach(key => {
        const value = personalInformation[ key ]
        const fieldValue = node.querySelector(`[data-automation-id='UserInfoForm_${key}']`).value
        if (fieldValue) {
          expect(fieldValue).toEqual(value)
        }
      })
    })
  })
})
