import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'

import * as ModalActions from '../../actions/ModalActions'
import * as ProfileActions from '../../actions/ProfileActions'

class UserHistoryModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleDeleteHistory = this.handleDeleteHistory.bind(this)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  handleDeleteHistory (event) {
    event.preventDefault()
    this.props.profileActions.manageHistory(2) // privacy=2 (never store history)
  }

  render () {
    return (
      <div data-automation-id="history_delete_modal" className="default-modal">
        <h1>Vil du slette historikk+</h1>
        <button className="grey-btn" onClick={this.handleCancel} data-automation-id="cancel_button">
          <FormattedMessage {...messages.cancel} />
        </button>
        <button className="black-btn" onClick={this.handleDeleteHistory} data-automation-id="delete_button">
          <FormattedMessage {...messages.deleteHistory} />
        </button>
      </div>
    )
  }
}

UserHistoryModal.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRequestingReservation: PropTypes.bool.isRequired,
  modalActions: PropTypes.object.isRequired,
  profileActions: PropTypes.object.isRequired
}

export const messages = defineMessages({
  deleteHistory: {
    id: 'UserSettings.deleteHistory',
    description: 'Button text for deleting history',
    defaultMessage: 'Delete'
  },
  cancel: {
    id: 'UserSettings.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
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
    modalActions: bindActionCreators(ModalActions, dispatch),
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHistoryModal)