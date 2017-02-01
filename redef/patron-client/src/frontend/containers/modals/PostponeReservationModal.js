import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

import * as ReservationActions from '../../actions/ReservationActions'
import * as ModalActions from '../../actions/ModalActions'
// import Libraries from '../../components/Libraries'

class PostponeReservationModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleReserve = this.handleReserve.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleReserve (event) {
    event.preventDefault()
    // this.props.reservationActions.reservePublication(this.props.recordId, this.librarySelect.getValue())
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  render () {
    return (
      <div data-automation-id="reserve_postpone_modal" className="default-modal">
        <form>
          <h2>
            <FormattedMessage {...messages.postponeReservation} />
          </h2>
          <button className="black-btn" data-automation-id="postpone_reserve_button">
            <FormattedMessage {...messages.okButton} />
          </button>
          <button className="grey-btn" onClick={this.handleCancel} data-automation-id="cancel_button">
            <FormattedMessage {...messages.cancel} />
          </button>
        </form>
      </div>
    )
  }

  /* render () {
    if (this.props.isError) {
      return this.renderError()
    } else if (this.props.isSuccess) {
      return this.renderSuccess()
    }
    return (
      <div data-automation-id="reservation_modal" className="default-modal">
        <form>
          <p>
            <FormattedMessage {...messages.choosePickupLocation} />
          </p>
          <br />
          <br />
          <button className="black-btn" data-automation-id="reserve_button"
                  disabled={this.props.isRequestingReservation}
                  onClick={this.handleReserve}>
            <FormattedMessage {...messages.okButton} />
          </button>
          <button className="grey-btn" disabled={this.props.isRequestingReservation} onClick={this.handleCancel}>
            <FormattedMessage {...messages.cancel} />
          </button>
        </form>
      </div>
    )
  } */
}

PostponeReservationModal.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRequestingReservation: PropTypes.bool.isRequired,
  reservationActions: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
  libraries: PropTypes.object.isRequired,
  recordId: PropTypes.string.isRequired,
  isSuccess: PropTypes.bool,
  isError: PropTypes.bool,
  message: PropTypes.string
}

export const messages = defineMessages({
  postponeReservation: {
    id: 'UserLoans.postponeReservation',
    description: 'The header text for postponing reservation dialog',
    defaultMessage: 'Postpone reservation'
  },
  okButton: {
    id: 'UserLoans.postponeReservationOK',
    description: 'The confirm button in postpone reservation dialog',
    defaultMessage: 'OK'
  },
  cancel: {
    id: 'UserLoans.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingReservation: state.reservation.isRequestingReservation,
    libraries: state.application.libraries
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

export { PostponeReservationModal }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(PostponeReservationModal)
