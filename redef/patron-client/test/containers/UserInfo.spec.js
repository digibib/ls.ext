/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import UserInfo from '../../src/frontend/containers/UserInfo'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { createStore } from 'redux'
import rootReducer from '../../src/frontend/reducers'
import { Provider } from 'react-redux'
import * as ProfileActions from '../../src/frontend/actions/ProfileActions'
import * as LoginActions from '../../src/frontend/actions/LoginActions'
import { formatDate } from '../../src/frontend/utils/dateFormatter'

function setup (propOverrides) {
  const props = {
    location: { query: {} },
    ...propOverrides
  }

  const profileInformation = {
    address: 'address',
    birthdate: 'birthdate',
    cardNumber: 'cardNumber',
    city: 'city',
    country: 'country',
    email: 'email',
    /* lastUpdated: '01/11/2016', */
    loanerCardIssued: 'loanerCardIssued',
    loanerCategory: 'loanerCategory',
    mobile: 'mobile',
    /* name: 'name', */
    zipcode: 'zipcode'
  }

  const store = createStore(rootReducer)
  store.dispatch(LoginActions.loginSuccess('test_username', 'test_borrowernumber', 'test_borrowerName'))
  store.dispatch(ProfileActions.receiveProfileInfo({info: profileInformation, attributes: {}}))

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en">
        <UserInfo {...props} />
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
  describe('UserInfo', () => {
    it('should display values from store', () => {
      const { node, store } = setup({ location: { query: {} } })
      const { personalInformation } = store.getState().profile
      Object.keys(personalInformation).forEach(key => {
        let value = personalInformation[ key ]
        if (key === 'lastUpdated') {
          value = formatDate(value)
        }
        expect(node.querySelector(`[data-automation-id='UserInfo_${key}']`).textContent.trim()).toEqual(value)
      })
    })
  })
})
