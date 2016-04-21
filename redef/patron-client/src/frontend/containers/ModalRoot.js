import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Reservation from './Reservation'
import Login from './Login'
import Modal from 'react-modal'
import * as ModalActions from '../actions/ModalActions'

const MODAL_COMPONENTS = {
  'LOGIN': Login,
  'RESERVATION': Reservation
}

const ModalRoot = React.createClass({
  propTypes: {
    modalType: PropTypes.string,
    modalProps: PropTypes.object.isRequired,
    modalActions: PropTypes.object.isRequired
  },
  render () {
    if (!this.props.modalType) {
      return null
    }
    const SpecificModal = MODAL_COMPONENTS[ this.props.modalType ]
    return (
      <Modal isOpen onRequestClose={this.props.modalActions.hideModal} style={customStyle}>
        <SpecificModal {...this.props.modalProps} />
      </Modal>
    )
  }
})

const customStyle = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)'
  },
  content: {
    top: '100px',
    bottom: '100px',
    left: '100px',
    right: '100px',
    borderRadius: '0px'
  }
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
