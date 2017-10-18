import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Reservation from './modals/ReservationModal'
import RemoteReservation from './modals/RemoteReservationModal'
import Login from './modals/LoginModal'
import Modal from 'react-modal'
import * as ModalActions from '../actions/ModalActions'
import CancelReservation from './modals/CancelReservationModal'
import Registration from './modals/RegistrationModal'
import PostponeReservation from './modals/PostponeReservationModal'

const MODAL_COMPONENTS = {
  'POSTPONE_RESERVATION': PostponeReservation,
  'CANCEL_RESERVATION': CancelReservation,
  'LOGIN': Login,
  'REGISTRATION': Registration,
  'RESERVATION': Reservation,
  'REMOTE_RESERVATION': RemoteReservation
}

class ModalRoot extends React.Component {
  render () {
    if (!this.props.modalType) {
      return null
    }
    const SpecificModal = MODAL_COMPONENTS[ this.props.modalType ]
    const ModalClasses = 'modal-overlay '.concat(this.props.modalType.toLowerCase(), '-modal-wrapper')
    typeof Modal.setAppElement === 'function' && Modal.setAppElement('#app')
    return (
      <Modal
        isOpen
        onRequestClose={this.props.modalActions.hideModal}
        className="modal-content"
        contentLabel={this.props.modalType}
        shouldCloseOnOverlayClick={false}
        overlayClassName={ModalClasses}>
        <SpecificModal {...this.props.modalProps} />
      </Modal>
    )
  }
}

ModalRoot.propTypes = {
  modalType: PropTypes.string,
  modalProps: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    modalType: state.modal.modalType,
    modalProps: state.modal.modalProps
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ModalRoot)
