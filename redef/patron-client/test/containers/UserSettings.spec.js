/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import UserSettings from '../../src/frontend/containers/UserSettings'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { createStore } from 'redux'
import rootReducer from '../../src/frontend/reducers'
import { Provider } from 'react-redux'
import * as ProfileActions from '../../src/frontend/actions/ProfileActions'

function setup (propOverrides) {
  const props = {
    ...propOverrides
  }

  const profileSettings = {
    alerts: {
      reminderOfDueDate: {
        sms: true,
        email: true
      },
      reminderOfPickup: {
        sms: true,
        email: true
      }
    },
    reciepts: {
      loans: {
        email: true
      },
      returns: {
        email: true
      }
    }
  }

  const store = createStore(rootReducer)
  store.dispatch(ProfileActions.receiveProfileSettings(profileSettings))

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en">
        <UserSettings {...props} />
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
  describe('UserSettings', () => {
    it('should display checked checkboxes when all settings are true', () => {
      const { node } = setup()
      const checkboxes = node.querySelectorAll("[type='checkbox']")
      expect(checkboxes.length).toEqual(6)
      Array.prototype.forEach.call(checkboxes, checkbox => expect(checkbox.checked).toEqual(true))
    })
  })
})
