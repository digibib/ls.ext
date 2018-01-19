import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

import RemoteReservationForm from '../forms/RemoteReservationForm'
import * as ModalActions from '../../actions/ModalActions'
import * as ReservationActions from '../../actions/ReservationActions'

class RemoteReservationModal extends React.Component {

  renderSuccess () {
    return (
      <div data-automation-id="remote_reservation_success_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
        <p>
          <FormattedMessage {...messages.messageSuccess} />
        </p>
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id="remote_reservation_error_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericReservationError} />}
        </p>
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  render () {
    if (this.props.isError) {
      return this.renderError()
    } else if (this.props.isSuccess) {
      return this.renderSuccess()
    } else {
      return (
        <section className="default-modal">
          <RemoteReservationForm messages={messages} />
        </section>
      )
    }
  }
}

RemoteReservationModal.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRequestingRemoteReservation: PropTypes.bool.isRequired,
  modalActions: PropTypes.object.isRequired,
  isSuccess: PropTypes.bool,
  isError: PropTypes.bool,
  message: PropTypes.string
}

export const messages = defineMessages({
  reserve: {
    id: 'RemoteReservationModal.reserve',
    description: 'The label the reserve button',
    defaultMessage: 'Reserve'
  },
  cancel: {
    id: 'RemoteReservationModal.cancel',
    description: 'The label for the cancel button',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'RemoteReservationModal.headerTextSuccess',
    description: 'The header text for the reservation success dialog',
    defaultMessage: 'Reservation was successful.'
  },
  messageSuccess: {
    id: 'RemoteReservationModal.messageSuccess',
    description: 'The reservation success message',
    defaultMessage: 'Your order has been placed and will be processed as soon as possible.'
  },
  headerTextError: {
    id: 'RemoteReservationModal.headerTextError',
    description: 'The header text for the reservation error dialog',
    defaultMessage: 'Reservation failed.'
  },
  genericReservationError: {
    id: 'RemoteReservationModal.genericReservationError',
    description: 'A generic reservation error message',
    defaultMessage: 'Something went wrong when reserving.\nPlease contact library for more information.'
  },
  materialNotAvailableForRemoteReserve: {
    id: 'RemoteReservationModal.materialNotAvailableForRemoteReserve',
    description: 'An error message when material is not available for remote reserve',
    defaultMessage: 'This material is not possible to reserve remotely.\nPlease contact library or try in a different library.'
  },
  button: {
    id: 'RemoteReservationModal.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'OK'
  },
  remoteReservation: {
    id: 'RemoteReservationModal.remoteReservation',
    description: 'The dialogue name of remote reservations',
    defaultMessage: 'Place remote reserve'
  },
  remoteReservationHeader: {
    id: 'RemoteReservationModal.remoteReservationHeader',
    description: 'Important information about remote reservations',
    defaultMessage: 'You are logged in as a remote library, so this reservation is placed on behalf of a patron at your home library.'
  },
  waitingListPrefix: {
    id: 'RemoteReservationModal.waitingListPrefix',
    description: 'Text prepended to waiting list notification',
    defaultMessage: 'There is a waiting list of ('
  },
  waitingListSuffix: {
    id: 'RemoteReservationModal.waitingListSuffix',
    description: 'Text appended to waiting list notification',
    defaultMessage: ') holds for this publication. Your reservation will not be processed until this list is empty.'
  },
  userId: {
    id: 'RemoteReservationModal.userId',
    description: 'The identifier of the remote patron the hold is placed for',
    defaultMessage: 'Order for (cardnumber)'
  },
  reserveLimitationNote: {
    id: 'RemoteReservationModal.reserveLimitationNote',
    description: 'Note on limits for reservations',
    defaultMessage: 'You may only order one item at a time'
  },
  reservationComment: {
    id: 'RemoteReservationModal.reservationComment',
    description: 'Label for comment field to be sent with reservation',
    defaultMessage: 'Reservation comments'
  },
  remoteReserveManagementInfoHeader: {
    id: 'RemoteReservationModal.remoteReserveManagementInfoHeader',
    description: 'Header text on managing of remote loans',
    defaultMessage: 'Manage remote loans.'
  },
  remoteReserveManagementInfo: {
    id: 'RemoteReservationModal.remoteReserveManagementInfo',
    description: 'Information on how to manage remote loans',
    defaultMessage: 'Remote loans can be suspended and cancelled on My Page. Contact library if you have any questions.'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingRemoteReservation: state.reservation.isRequestingRemoteReservation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

export { RemoteReservationModal }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(RemoteReservationModal)
