/* eslint-env mocha */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import UserLoans from '../../src/frontend/containers/UserLoans'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'
import { createStore } from 'redux'
import rootReducer from '../../src/frontend/reducers'
import { Provider } from 'react-redux'
import * as LibraryActions from '../../src/frontend/actions/LibraryActions'
import * as ProfileActions from '../../src/frontend/actions/ProfileActions'
import * as LoginActions from '../../src/frontend/actions/LoginActions'
import { formatDate } from '../../src/frontend/utils/dateFormatter'

function setup (propOverrides) {
  const props = {
    location: { pathname: '', query: {} },
    mediaQueryValues: { width: 992 },
    patronCategory: 'V',
    ...propOverrides
  }

  const store = createStore(rootReducer)
  const libraries = {
    'branchCode_1': 'library_1',
    'branchCode_2': 'library_2',
    'branchCode_3': 'library_3'
  }
  store.dispatch(LibraryActions.receiveLibraries(libraries))
  store.dispatch(LoginActions.loginSuccess('test_username', 'test_borrowernumber', 'test_borrowerName'))
  const loansAndReservations = {
    pickups: [
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_1',
        recordId: 'recordId_1',
        title: 'title_1',
        contributors: [
          {
            agent: {
              name: 'author_1',
              uri: 'http://author.com'
            },
            mainEntry: true,
            role: 'http://data.deichman.no/role#author'
          }
        ],
        publicationYear: 'publicationYear_1',
        expirationDate: '01/10/2016',
        pickupNumber: 'pickupNumber_1',
        branchCode: 'branchCode_1'
      },
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_2',
        recordId: 'recordId_2',
        title: 'title_2',
        contributors: [
          {
            mainEntry: true,
            agent: { name: 'author_1' }
          }
        ],
        publicationYear: 'publicationYear_1',
        expirationDate: '02/10/2016',
        pickupNumber: 'pickupNumber_2',
        branchCode: 'branchCode_2'
      }
    ],
    holds: [
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_1',
        recordId: 'recordId_1',
        title: 'title_1',
        contributors: [
          {
            mainEntry: true,
            agent: { name: 'author_1' }
          }
        ],
        queuePlace: '1',
        expected: '1–2',
        expectedTestData: '(~ 1–2 weeks)',
        branchCode: 'branchCode_1',
        estimatedWait: {
          error: null,
          estimate: 2,
          pending: false
        }
      },
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_2',
        recordId: 'recordId_2',
        title: 'title_2',
        contributors: [
          {
            mainEntry: true,
            agent: { name: 'author_2' }
          }
        ],
        queuePlace: '6',
        expected: '12',
        expectedTestData: '(more than 12 weeks)',
        branchCode: 'branchCode_2',
        estimatedWait: {
          error: null,
          estimate: 2,
          pending: false
        }
      },
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'reserveId_3',
        recordId: 'recordId_3',
        title: 'title_3',
        author: 'author_x',
        queuePlace: '3',
        expected: 'unknown',
        expectedTestData: '(Unknown waiting period)',
        branchCode: 'branchCode_3',
        estimatedWait: {
          error: null,
          estimate: 2,
          pending: false
        }
      }
    ],
    remoteholds: [
      {
        id: 'reserveId_1',
        title: 'title_1',
        queuePlace: '1',
        branchCode: 'branchCode_1',
        author: 'author_x'
      },
      {
        id: 'reserveId_2',
        recordId: 'recordId_2',
        title: 'title_2',
        queuePlace: '6',
        branchCode: 'branchCode_2',
        author: 'author_x'
      }
    ],
    loans: [
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'loansId_1',
        recordId: 'recordId_1',
        title: 'title_1',
        contributors: [
          {
            mainEntry: true,
            agent: { name: 'author_1' }
          }
        ],
        publicationYear: 'publicationYear_1',
        dueDate: '2017-01-01',
        checkoutId: 'checkoutId_1'
      },
      {
        mediaType: 'http://data.deichman.no/mediaType#Film',
        id: 'loansId_2',
        recordId: 'recordId_2',
        title: 'title_2',
        contributors: [
          {
            mainEntry: true,
            agent: { name: 'author_2' }
          }
        ],
        publicationYear: 'publicationYear_2',
        dueDate: '2016-12-12',
        checkoutId: 'checkoutId_2'
      }
    ],
    remoteloans: [
      {
        id: 'loansId_1',
        title: 'title_1',
        author: 'author_x',
        publicationYear: 'publicationYear_1',
        dueDate: '2017-01-01',
        checkoutId: 'checkoutId_1'
      },
      {
        id: 'loansId_2',
        title: 'title_2',
        author: 'author_x',
        publicationYear: 'publicationYear_2',
        dueDate: '2016-12-12',
        checkoutId: 'checkoutId_2'
      }
    ]
  }
  store.dispatch(ProfileActions.receiveProfileLoans(loansAndReservations))

  const messages = {
    'http://data.deichman.no/mediaType#Film': 'FILM',
    'branchCode_1': 'Branch 1',
    'branchCode_2': 'Branch 2'
  }

  const output = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <IntlProvider locale="en" messages={messages}>
        <UserLoans {...props} />
      </IntlProvider>
    </Provider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output),
    store: store,
    messages: messages
  }
}

describe('containers', () => {
  describe('UserLoans', () => {
    it('should display pickups', () => {
      const { node, store, messages } = setup()
      const { loansAndReservations } = store.getState().profile
      const pickups = node.querySelectorAll("[data-automation-id='UserLoans_pickup']")
      expect(pickups.length).toEqual(2)
      Array.prototype.forEach.call(pickups, (pickup, index) => {
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_type']").textContent).toEqual(messages[loansAndReservations.pickups[ index ].mediaType])
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_title']").textContent).toEqual(loansAndReservations.pickups[ index ].title)
        expect(pickup.querySelector("[data-automation-id='work_contributor_link']").textContent).toEqual(loansAndReservations.pickups[ index ].contributors[0].agent.name)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_expiry']").textContent).toEqual(formatDate(new Date(Date.parse(loansAndReservations.pickups[ index ].expirationDate) + (1000 * 60 * 60 * 24 * 7)).toISOString(1).split('T')[ 0 ]))
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_pickupNumber']").textContent).toEqual(loansAndReservations.pickups[ index ].pickupNumber)
        expect(pickup.querySelector("[data-automation-id='UserLoans_pickup_branch']").textContent).toEqual(messages[ loansAndReservations.pickups[ index ].branchCode ])
      })
    })

    it('should display holds', () => {
      const { node, store, messages } = setup()
      const { loansAndReservations } = store.getState().profile
      const { libraries } = store.getState().application
      const holds = node.querySelectorAll("[data-automation-id='UserLoans_reservation']")
      expect(holds.length).toEqual(3)
      // indexMap is used because the component sorts the output
      const indexMap = {
        0: 0,
        1: 2,
        2: 1
      }
      Array.prototype.forEach.call(holds, (hold, index) => {
        expect(hold.querySelector("[data-automation-id='UserLoans_reservation_type']").textContent).toEqual(messages[loansAndReservations.holds[ index ].mediaType])
        expect(hold.querySelector("[data-automation-id='UserLoans_reservation_title']").textContent).toEqual(loansAndReservations.holds[ indexMap[ index ] ].title)
        expect(hold.querySelector("[data-automation-id='UserLoans_reservation_queue_place']").textContent).toEqual(loansAndReservations.holds[ indexMap[ index ] ].queuePlace)
        const select = hold.querySelector("[data-automation-id='UserLoans_reservation_library'] select")
        expect(select.options[ select.selectedIndex ].textContent).toEqual(libraries[ loansAndReservations.holds[ indexMap[ index ] ].branchCode ])
      })
    })

    it('should display holds on smaller screens', () => {
      const { node, store, messages } = setup({ mediaQueryValues: { width: 991 } })
      const { loansAndReservations } = store.getState().profile
      const { libraries } = store.getState().application
      const holds = node.querySelectorAll("[data-automation-id='UserLoans_reservation']")
      expect(holds.length).toEqual(3)
      // indexMap is used because the component sorts the output
      const indexMap = {
        0: 0,
        1: 2,
        2: 1
      }
      Array.prototype.forEach.call(holds, (hold, index) => {
        expect(hold.querySelector("[data-automation-id='UserLoans_reservation_type']").textContent).toEqual(messages[loansAndReservations.holds[ indexMap[ index ] ].mediaType])
        expect(hold.querySelector("[data-automation-id='UserLoans_reservation_title']").textContent).toEqual(loansAndReservations.holds[ indexMap[ index ] ].title)
        expect(hold.querySelector("[data-automation-id='UserLoans_reservation_queue_place']").textContent).toEqual(loansAndReservations.holds[ indexMap[ index ] ].queuePlace)
        const select = hold.querySelector("[data-automation-id='UserLoans_reservation_library'] select")
        expect(select.options[ select.selectedIndex ].textContent).toEqual(libraries[ loansAndReservations.holds[ indexMap[ index ] ].branchCode ])
      })
    })

    it('should display main contributor if present, otherwise author', () => {
      const { node, store } = setup()
      const { loansAndReservations } = store.getState().profile
      const holds = node.querySelectorAll("[data-automation-id='UserLoans_reservation']")
      // Shifted due to sorting of element
      expect(holds[0].querySelector("[data-automation-id='work_contributor_link']").textContent).toEqual(loansAndReservations.holds[0].contributors[0].agent.name)
      expect(holds[1].querySelector("[data-automation-id='UserLoans_author_name']").textContent).toEqual(loansAndReservations.holds[2].author)
      expect(holds[2].querySelector("[data-automation-id='work_contributor_link']").textContent).toEqual(loansAndReservations.holds[1].contributors[0].agent.name)
    })

    it('should display loans', () => {
      const { node, store } = setup({ mediaQueryValues: { width: 991 } })
      const { loansAndReservations } = store.getState().profile
      const loans = node.querySelectorAll("[data-automation-id='UserLoans_loan']")
      expect(loans.length).toEqual(2)
      // indexMap is used because the component sorts the output
      const indexMap = {
        0: 1,
        1: 0
      }
      Array.prototype.forEach.call(loans, (loan, index) => {
        expect(loan.querySelector("[data-automation-id='work_contributor_link']").textContent).toEqual(loansAndReservations.loans[ indexMap[ index ] ].contributors[0].agent.name)
        expect(loan.querySelector("[data-automation-id='UserLoans_loan_title']").textContent).toEqual(loansAndReservations.loans[ indexMap[ index ] ].title)
        expect(loan.querySelector("[data-automation-id='UserLoans_publicationYear']").textContent).toEqual(loansAndReservations.loans[ indexMap[ index ] ].publicationYear)
        expect(loan.querySelector("[data-automation-id='UserLoans_dueDate']").textContent).toEqual(formatDate(loansAndReservations.loans[ indexMap[ index ] ].dueDate))
      })
    })

    it('should display remote loans', () => {
      const { node, store } = setup({ mediaQueryValues: { width: 991 } })
      const { loansAndReservations } = store.getState().profile
      const remoteloans = node.querySelectorAll("[data-automation-id='UserLoans_remoteLoan']")
      expect(remoteloans.length).toEqual(2)
      // indexMap is used because the component sorts the output
      const indexMap = {
        0: 1,
        1: 0
      }
      Array.prototype.forEach.call(remoteloans, (remoteloan, index) => {
        expect(remoteloan.querySelector("[data-automation-id='UserLoans_author_name']").textContent).toEqual(loansAndReservations.remoteloans[ indexMap[ index ] ].author)
        expect(remoteloan.querySelector("[data-automation-id='UserLoans_remoteLoan_title']").textContent).toEqual(loansAndReservations.remoteloans[ indexMap[ index ] ].title)
        expect(remoteloan.querySelector("[data-automation-id='UserLoans_dueDate']").textContent).toEqual(formatDate(loansAndReservations.remoteloans[ indexMap[ index ] ].dueDate))
      })
    })

    it('should display remote holds', () => {
      const { node, store } = setup({ mediaQueryValues: { width: 991 } })
      const { loansAndReservations } = store.getState().profile
      const remoteholds = node.querySelectorAll("[data-automation-id='UserLoans_remoteHold']")
      expect(remoteholds.length).toEqual(2)
      Array.prototype.forEach.call(remoteholds, (remotehold, index) => {
        expect(remotehold.querySelector("[data-automation-id='UserLoans_author_name']").textContent).toEqual(loansAndReservations.remoteholds[index].author)
        expect(remotehold.querySelector("[data-automation-id='UserLoans_remoteHold_title']").textContent).toEqual(loansAndReservations.remoteholds[index].title)
        expect(remotehold.querySelector("[data-automation-id='UserLoans_remoteHold_queue_place']").textContent).toEqual(loansAndReservations.remoteholds[index].queuePlace)
      })
    })
  })
})
