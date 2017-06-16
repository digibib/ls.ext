import PropTypes from 'prop-types'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, defineMessages } from 'react-intl'

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
  modalActions: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingReservation: state.reservation.isRequestingReservation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
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
