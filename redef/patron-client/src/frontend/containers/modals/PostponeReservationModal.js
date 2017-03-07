import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, defineMessages } from 'react-intl'

import * as ReservationActions from '../../actions/ReservationActions'
import * as ModalActions from '../../actions/ModalActions'
import PostponeForm from '../../containers/forms/PostponeReservationForm'

class PostponeReservationModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  render () {
    return (
      <div data-automation-id="reserve_postpone_modal" className="default-modal">
        <PostponeForm />
      </div>
    )
  }
}

PostponeReservationModal.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRequestingReservation: PropTypes.bool.isRequired,
  reservationActions: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
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
  },
  date: {
    id: 'UserLoans.dateFormat',
    description: 'Date placeholder for datepicker in postpone reservation dialog',
    defaultMessage: 'dd.mm.yyyy'
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

let intlPostponeReservationModal = injectIntl(PostponeReservationModal)

intlPostponeReservationModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(intlPostponeReservationModal)

export { intlPostponeReservationModal as PostponeReservationModal }

export default intlPostponeReservationModal
