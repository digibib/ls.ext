/* eslint-env mocha */
/* global findElementByDataAutomationId */
import expect from 'expect'
import React from 'react'
import TestUtils from 'react-addons-test-utils'
import { ReservationModal } from '../../../src/frontend/containers/modals/ReservationModal'
import ReactDOM from 'react-dom'
import { IntlProvider } from 'react-intl'

function setup (propOverrides) {
  const props = {
    isLoggedIn: true,
    isRequestingReservation: false,
    reservationActions: { reservePublication: expect.createSpy() },
    libraries: { 'L1': 'Library One', 'L2': 'Library Two' },
    publication: { formats: ['http://data.deichman.no/format#Book'], recordId: 'test_recordId', items: [{ itemnumber: 123 }] },
    modalActions: {},
    ...propOverrides
  }

  const output = TestUtils.renderIntoDocument(
    <IntlProvider locale="en">
      <ReservationModal {...props} />
    </IntlProvider>
  )

  return {
    props: props,
    output: output,
    node: ReactDOM.findDOMNode(output)
  }
}

describe('containers', () => {
  describe('ReservationModal', () => {
    it('should display success dialog', () => {
      const { node } = setup({ isSuccess: true, message: 'test', recordId: 'test_recordId' })
      expect(node.getAttribute('data-automation-id')).toEqual('reservation_success_modal')
    })

    it('should display error dialog', () => {
      const { node } = setup({ isError: true, message: 'test', recordId: 'test_recordId' })
      expect(node.getAttribute('data-automation-id')).toEqual('reservation_error_modal')
    })

    it('should pass publication object with record ID and formats when clicking reserve publication button', () => {
      const { output, props } = setup({ publication: { formats: [], recordId: 'test_recordId' }, items: [{ itemnumber: 123 }] })
      const reserveButton = findElementByDataAutomationId(output, 'reserve_button')
      TestUtils.Simulate.click(reserveButton)
      expect(props.reservationActions.reservePublication).toHaveBeenCalled()
      expect(props.reservationActions.reservePublication.calls[ 0 ].arguments).toEqual([ 'test_recordId', 'L1' ])
    })
  })
})
