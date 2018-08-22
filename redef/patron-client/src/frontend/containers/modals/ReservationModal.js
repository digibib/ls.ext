import PropTypes from 'prop-types'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

import * as ReservationActions from '../../actions/ReservationActions'
import * as ModalActions from '../../actions/ModalActions'
import Libraries from '../../components/Libraries'
import { filterPickupLibrariesByItems } from '../../utils/libraryFilters'

class ReservationModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleReserve = this.handleReserve.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleReserve (event) {
    event.preventDefault()
    this.props.reservationActions.reservePublication(this.props.publication.recordId, this.librarySelect.getValue())
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSuccess () {
    return (
      <div data-automation-id="reservation_success_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
        <p>
          <FormattedMessage {...messages.messageSuccess} />
        </p>
        <button className="blue-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id="reservation_error_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericReservationError} />}
        </p>
        <button className="blue-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderLibrarySelect () {
    if (this.props.publication.formats && this.props.publication.formats.indexOf('http://data.deichman.no/format#MusicalInstrument') >= 0) {
      return (
        <div>
          <Libraries ref={e => this.librarySelect = e}
                     libraries={filterPickupLibrariesByItems(this.props.libraries, this.props.publication.items)} />
          <p>
            <FormattedMessage {...messages.filteredPickupFromOwnerBranch} />
          </p>
        </div>
      )
    } else {
      return (
        <Libraries ref={e => this.librarySelect = e} libraries={this.props.libraries} selectedBranchCode={this.props.pickupLocation} />
      )
    }
  }

  render () {
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
          {this.renderLibrarySelect()}
          <br />
          <br />
          <button className="blue-btn" data-automation-id="reserve_button"
                  disabled={this.props.isRequestingReservation}
                  onClick={this.handleReserve}>
            <FormattedMessage {...messages.reserve} />
          </button>
          <button className="grey-btn" disabled={this.props.isRequestingReservation} onClick={this.handleCancel}>
            <FormattedMessage {...messages.cancel} />
          </button>
        </form>
      </div>
    )
  }
}

ReservationModal.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRequestingReservation: PropTypes.bool.isRequired,
  reservationActions: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
  libraries: PropTypes.object.isRequired,
  publication: PropTypes.object.isRequired,
  isSuccess: PropTypes.bool,
  isError: PropTypes.bool,
  message: PropTypes.string,
  pickupLocation: PropTypes.string
}

export const messages = defineMessages({
  choosePickupLocation: {
    id: 'ReservationModal.choosePickupLocation',
    description: 'The label for choosing pickup location:',
    defaultMessage: 'Choose pickup location'
  },
  filteredPickupFromOwnerBranch: {
    id: 'ReservationModal.filteredPickupFromOwnerBranch',
    description: 'Message when material is restricted for pickup only at owning branch',
    defaultMessage: 'This material is restricted for pickup at owning branch only.'
  },
  reserve: {
    id: 'ReservationModal.reserve',
    description: 'The label the reserve button',
    defaultMessage: 'Reserve'
  },
  cancel: {
    id: 'ReservationModal.cancel',
    description: 'The label for the cancel button',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'ReservationModal.headerTextSuccess',
    description: 'The header text for the reservation success dialog',
    defaultMessage: 'The reservation is successful.'
  },
  messageSuccess: {
    id: 'ReservationModal.messageSuccess',
    description: 'The reservation success message',
    defaultMessage: 'You will receive a message by e-mail or SMS when it is ready for pickup.'
  },
  headerTextError: {
    id: 'ReservationModal.headerTextError',
    description: 'The header text for the reservation error dialog',
    defaultMessage: 'The reservation failed.'
  },
  genericReservationError: {
    id: 'ReservationModal.genericReservationError',
    description: 'A generic reservation error message',
    defaultMessage: 'Something went wrong when reserving #sadpanda'
  },
  tooManyReserves: {
    id: 'ReservationModal.tooManyReserves',
    description: 'The error message when the user has too many reserves',
    defaultMessage: 'Too many reserves already placed.'
  },
  ageRestriction: {
    id: 'ReservationModal.ageRestriction',
    description: 'The error message when the user is to young',
    defaultMessage: 'You are not old enough to borrow this item.'
  },
  notForRemoteLoan: {
    id: 'ReservationModal.notForRemoteLoan',
    description: 'The error message when item is not for remote loan',
    defaultMessage: 'This item is not available for remote loan'
  },
  button: {
    id: 'ReservationModal.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'OK'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingReservation: state.reservation.isRequestingReservation,
    libraries: state.application.libraries,
    pickupLocation: state.reservation.pickupLocation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

export { ReservationModal }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReservationModal)
