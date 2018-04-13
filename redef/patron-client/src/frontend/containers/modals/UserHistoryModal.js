import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

import * as ModalActions from '../../actions/ModalActions'
import * as ProfileActions from '../../actions/ProfileActions'
import * as HistoryActions from '../../actions/HistoryActions'

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
    this.props.profileActions.manageHistory(2, this.props.personalAttributes.hist_cons) // privacy=2 (never store history)
    this.props.historyActions.deleteAllHistory()
    this.props.modalActions.hideModal()
  }

  render () {
    return (
      <div data-automation-id="history_delete_modal" className="default-modal">
        <h1 style={{ fontSize: '1em', marginBottom: '1em' }}><FormattedMessage {...messages.deleteHistoryTitle} /></h1>
        <p>
          <FormattedMessage {...messages.deleteHistoryExplainer} />
        </p>
        <div style={{ textAlign: 'center' }}>
          <button className="grey-btn" onClick={this.handleCancel} data-automation-id="cancel_button">
            <FormattedMessage {...messages.cancel} />
          </button>
          <button className="black-btn" onClick={this.handleDeleteHistory} data-automation-id="delete_button">
            <FormattedMessage {...messages.delete} />
          </button>
        </div>
      </div>
    )
  }
}

UserHistoryModal.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRequestingReservation: PropTypes.bool.isRequired,
  personalAttributes: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
  profileActions: PropTypes.object.isRequired,
  historyActions: PropTypes.object.isRequired
}

export const messages = defineMessages({
  deleteHistoryTitle: {
    id: 'History.deleteHistoryTitle',
    description: 'Delete history modal title',
    defaultMessage: 'Would you like to delete your history'
  },
  delete: {
    id: 'History.delete',
    description: 'Button text for deleting history',
    defaultMessage: 'Delete'
  },
  cancel: {
    id: 'History.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  deleteHistoryExplainer: {
    id: 'History.deleteHistoryExplainer',
    description: 'Explainer text in popup when user tries to remove history storage',
    defaultMessage: 'Your loan history will be anonymized/deleted within 24 hours.'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingReservation: state.reservation.isRequestingReservation,
    personalAttributes: state.profile.personalAttributes
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    modalActions: bindActionCreators(ModalActions, dispatch),
    profileActions: bindActionCreators(ProfileActions, dispatch),
    historyActions: bindActionCreators(HistoryActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserHistoryModal)
