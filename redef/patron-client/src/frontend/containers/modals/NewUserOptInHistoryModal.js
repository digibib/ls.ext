import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

import * as ModalActions from '../../actions/ModalActions'
import * as ProfileActions from '../../actions/ProfileActions'

class NewUserOptInHistoryModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleConsentLater = this.handleConsentLater.bind(this)
    this.handleOptInHistory = this.handleOptInHistory.bind(this)
  }

  handleConsentLater (event) {
    event.preventDefault()
    this.props.profileActions.manageHistoryConsent(false)
    this.props.modalActions.hideModal()
  }

  handleOptInHistory (event) {
    event.preventDefault()
    this.props.profileActions.manageHistoryConsent(true)
    this.props.modalActions.hideModal()
  }

  render () {
    return (
      <div data-automation-id="new_user_keep_history_modal" className="default-modal">
        <h1 style={{ fontSize: '1em', marginBottom: '1em' }}><FormattedMessage {...messages.saveMyHistoryHeader} /></h1>
        <p>
          <FormattedMessage {...messages.saveMyHistoryInformation} />
        </p>
        <div style={{ textAlign: 'center' }}>
          <button className="blue-btn" onClick={this.handleOptInHistory} data-automation-id="opt_in_button">
            <FormattedMessage {...messages.saveConsent} />
          </button>
          <button className="close-modal-button" onClick={this.handleConsentLater} data-automation-id="cancel_button">
            <FormattedMessage {...messages.consentLater} />
          </button>
        </div>
      </div>
    )
  }
}

NewUserOptInHistoryModal.propTypes = {
  modalActions: PropTypes.object.isRequired,
  profileActions: PropTypes.object.isRequired
}

export const messages = defineMessages({
  saveConsent: {
    id: 'UserSettings.saveConsent',
    description: 'The label for the save button',
    defaultMessage: 'Yes please'
  },
  consentLater: {
    id: 'UserSettings.consentLater',
    description: 'The cancel button text',
    defaultMessage: 'Not now'
  },
  saveMyHistoryHeader: {
    id: 'UserSettings.saveMyHistoryHeader',
    description: 'The heading for save my history consent',
    defaultMessage: 'You are now able to save yor history!'
  },
  saveMyHistoryInformation: {
    id: 'UserSettings.saveMyHistoryInformation',
    description: 'The heading for save my history consent',
    defaultMessage: 'You will have a full history of what you have ...'
  }
})

function mapStateToProps (state) {
  return { }
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
)(NewUserOptInHistoryModal)
