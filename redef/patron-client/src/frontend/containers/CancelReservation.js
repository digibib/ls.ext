import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as ReservationActions from '../actions/ReservationActions'
import * as ModalActions from '../actions/ModalActions'

class CancelReservation extends React.Component {
  constructor (props) {
    super(props)
    this.handleCancelReservation = this.handleCancelReservation.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleCancelReservation (event) {
    event.preventDefault()
    this.props.reservationActions.cancelReservation(this.props.reserveId)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSuccess () {
    return (
      <div data-automation-id="cancel_reservation_success_modal" className="default-modal">
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
      <div data-automation-id="cancel_reservation_error_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericCancelReservationError} />}
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
    }
    return (
      <div data-automation-id="cancel_reservation_modal" className="default-modal">
        <h2>{this.props.message}</h2>
        <button className="black-btn" disabled={this.props.isRequestingCancelReservation} onClick={this.handleCancelReservation}
                data-automation-id="confirm_button">
          <FormattedMessage {...messages.cancelReservation} />
        </button>
        <button className="grey-btn" disabled={this.props.isRequestingCancelReservation} onClick={this.handleCancel}
                data-automation-id="cancel_button">
          <FormattedMessage {...messages.cancel} />
        </button>
      </div>
    )
  }
}

const messages = defineMessages({
  button: {
    id: 'CancelReservation.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'Close'
  },
  cancelReservation: {
    id: 'CancelReservation.cancelReservation',
    description: 'The cancel loan button text',
    defaultMessage: 'Cancel loan'
  },
  cancel: {
    id: 'CancelReservation.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'CancelReservation.headerTextSuccess',
    description: 'The header text for the cancel reservation success dialog',
    defaultMessage: 'Success!'
  },
  messageSuccess: {
    id: 'CancelReservation.messageSuccess',
    description: 'The cancel reservation success message',
    defaultMessage: 'The reservation is now cancelled.'
  },
  headerTextError: {
    id: 'CancelReservation.headerTextError',
    description: 'The header text for the cancel reservation error dialog',
    defaultMessage: 'Failure'
  },
  genericCancelReservationError: {
    id: 'CancelReservation.genericCancelReservationError',
    description: 'A generic message when cancelling the reservation goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Something went wrong when attempting to cancel the reservation!'
  }
})

CancelReservation.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  reservationActions: PropTypes.object.isRequired,
  reserveId: PropTypes.string.isRequired,
  isRequestingCancelReservation: PropTypes.bool.isRequired,
  message: PropTypes.string,
  isError: PropTypes.bool,
  isSuccess: PropTypes.bool,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingCancelReservation: state.reservation.isRequestingCancelReservation,
    loginError: state.application.loginError
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

const intlCancelReservation = injectIntl(CancelReservation)
export { intlCancelReservation as CancelReservation }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(intlCancelReservation)
