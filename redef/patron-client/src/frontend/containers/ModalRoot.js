import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Reservation from './Reservation'
import Login from './Login'
import Modal from 'react-modal'
import * as ModalActions from '../actions/ModalActions'
import CancelReservation from './CancelReservation'
import ExtendLoan from './ExtendLoan'
import Registration from './Registration'

const MODAL_COMPONENTS = {
  'CANCEL_RESERVATION': CancelReservation,
  'EXTEND_LOAN': ExtendLoan,
  'LOGIN': Login,
  'REGISTRATION': Registration,
  'RESERVATION': Reservation
}

class ModalRoot extends React.Component {
  render () {
    if (!this.props.modalType) {
      return null
    }
    const SpecificModal = MODAL_COMPONENTS[ this.props.modalType ]
    return (
      <Modal isOpen onRequestClose={this.props.modalActions.hideModal} className="modal-content"
             overlayClassName="modal-overlay">
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
