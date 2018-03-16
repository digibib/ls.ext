import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Reservation from './modals/ReservationModal'
import RemoteReservation from './modals/RemoteReservationModal'
import Login from './modals/LoginModal'
import Modal from 'react-modal'
import * as ModalActions from '../actions/ModalActions'
import CancelReservation from './modals/CancelReservationModal'
import PostponeReservation from './modals/PostponeReservationModal'
import UserHistoryModal from './modals/UserHistoryModal'
import NewUserOptInHistoryModal from './modals/NewUserOptInHistoryModal'

const MODAL_COMPONENTS = {
  'USER_HISTORY': UserHistoryModal,
  'POSTPONE_RESERVATION': PostponeReservation,
  'CANCEL_RESERVATION': CancelReservation,
  'LOGIN': Login,
  'RESERVATION': Reservation,
  'REMOTE_RESERVATION': RemoteReservation,
  'NEW_USER_OPT_IN_HISTORY': NewUserOptInHistoryModal
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
