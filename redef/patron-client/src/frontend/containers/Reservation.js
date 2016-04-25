import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

import Branches from '../constants/Branches'
import * as ReservationActions from '../actions/ReservationActions'
import * as ModalActions from '../actions/ModalActions'

const Reservation = React.createClass({
  propTypes: {
    recordId: PropTypes.string.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    isRequestingReservation: PropTypes.bool.isRequired,
    reservationActions: PropTypes.object.isRequired,
    modalActions: PropTypes.object.isRequired,
    isSuccess: PropTypes.bool,
    isError: PropTypes.bool,
    message: PropTypes.string
  },
  renderBranches () {
    const branchOptions = []
    Object.keys(Branches).forEach(branchCode => {
      const branchName = Branches[ branchCode ]
      branchOptions.push(<option key={branchCode} value={branchCode}>{branchName}</option>)
    })
    return branchOptions
  },
  handleReserve (event) {
    event.preventDefault()
    this.props.reservationActions.reservePublication(this.props.recordId, this.branchSelect.value)
  },
  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  },
  renderSuccess () {
    return (
      <div>
        <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
        <p><FormattedMessage {...messages.messageSuccess} /></p>
        <button onClick={this.props.modalActions.hideModal}><FormattedMessage {...messages.button} /></button>
      </div>
    )
  },
  renderError () {
    return (
      <div>
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>{messages[ this.props.message ]
          ? <FormattedMessage {...messages[ this.props.message ]} />
          : <FormattedMessage {...messages.genericReservationError} />}
        </p>
        <button onClick={this.props.modalActions.hideModal}><FormattedMessage {...messages.button} /></button>
      </div>
    )
  },
  render () {
    if (this.props.isError) {
      return this.renderError()
    } else if (this.props.isSuccess) {
      return this.renderSuccess()
    }
    return (
      <div>
        <form>
          <label><FormattedMessage {...messages.choosePickupLocation} /></label>
          <select ref={e => this.branchSelect = e}>
            {this.renderBranches()}
          </select>
          <button disabled={this.props.isRequestingReservation} onClick={this.handleReserve}>
            <FormattedMessage {...messages.reserve} />
          </button>
          <button disabled={this.props.isRequestingReservation} onClick={this.handleCancel}>
            <FormattedMessage {...messages.cancel} />
          </button>
        </form>
      </div>
    )
  }
})

const messages = defineMessages({
  choosePickupLocation: {
    id: 'Reservation.choosePickupLocation',
    description: 'The label for choosing pickup location',
    defaultMessage: 'Choose pickup location'
  },
  reserve: {
    id: 'Reservation.reserve',
    description: 'The label the reserve button',
    defaultMessage: 'Reserve'
  },
  cancel: {
    id: 'Reservation.cancel',
    description: 'The label for the cancel button',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'Reservation.headerTextSuccess',
    description: 'The header text for the reservation success dialog',
    defaultMessage: 'The reservation is successful.'
  },
  messageSuccess: {
    id: 'Reservation.messageSuccess',
    description: 'The reservation success message',
    defaultMessage: 'You will receive a message by e-mail or SMS when it is ready for pickup.'
  },
  headerTextError: {
    id: 'Reservation.headerTextError',
    description: 'The header text for the reservation error dialog',
    defaultMessage: 'The reservation failed.'
  },
  genericReservationError: {
    id: 'Reservation.genericReservationError',
    description: 'A generic reservation error message',
    defaultMessage: 'Something went wrong when reserving #sadpanda'
  },
  tooManyReserves: {
    id: 'Reservation.tooManyReserves',
    description: 'The error message when the user has too many reserves',
    defaultMessage: 'Too many reserves already placed.'
  },
  button: {
    id: 'Reservation.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'OK'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingReservation: state.reservation.isRequestingReservation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Reservation)
