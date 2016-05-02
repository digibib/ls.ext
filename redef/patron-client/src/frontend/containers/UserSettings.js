import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import * as ProfileActions from '../actions/ProfileActions'

const UserSettings = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    profileActions: PropTypes.object.isRequired,
    isRequestingSettings: PropTypes.bool.isRequired,
    settingsError: PropTypes.object.isRequired,
    settings: PropTypes.object
  },
  handleSaveClick (event) {
    event.preventDefault()
    const profileSettings = {
      alerts: {
        reminderOfDueDate: {
          sms: this.reminderOfDueDateSmsCheckbox.checked,
          email: this.reminderOfDueDateEmailCheckbox.checked
        },
        reminderOfPickup: {
          sms: this.reminderOfPickupSmsCheckbox.checked,
          email: this.reminderOfPickupEmailCheckbox.checked
        }
      },
      reciepts: {
        loans: {
          email: this.recieptOnLoansEmailCheckbox.checked
        },
        returns: {
          email: this.recieptOnReturnsEmailCheckbox.checked
        }
      }
    }
    this.props.profileActions.postProfileSettings(profileSettings)
  },
  render () {
    if (this.props.isRequestingSettings) {
      return <div />
    } else if (this.props.settingsError) {
      return <FormattedMessage {...messages.settingsError} />
    }
    return (
      <div>
        <div style={{display: 'inline-block', width: '50%'}}>
          <h3><FormattedMessage {...messages.alerts} /></h3>
          <h4><FormattedMessage {...messages.reminderOfDueDate} /></h4>
          <input type='checkbox' ref={e => this.reminderOfDueDateSmsCheckbox = e}
                 defaultChecked={this.props.settings.alerts.reminderOfDueDate.sms} />
          <FormattedMessage {...messages.bySms} /><br />
          <input type='checkbox' ref={e => this.reminderOfDueDateEmailCheckbox = e}
                 defaultChecked={this.props.settings.alerts.reminderOfDueDate.email} />
          <FormattedMessage {...messages.byEmail} />
          <h4><FormattedMessage {...messages.reminderOfPickup} /></h4>
          <input type='checkbox' ref={e => this.reminderOfPickupSmsCheckbox = e}
                 defaultChecked={this.props.settings.alerts.reminderOfPickup.sms} />
          <FormattedMessage {...messages.bySms} /><br />
          <input type='checkbox' ref={e => this.reminderOfPickupEmailCheckbox = e}
                 defaultChecked={this.props.settings.alerts.reminderOfPickup.email} />
          <FormattedMessage {...messages.byEmail} />
        </div>
        <div style={{display: 'inline-block', width: '50%'}}>
          <h3><FormattedMessage {...messages.reciepts} /></h3>
          <input type='checkbox' ref={e => this.recieptOnLoansEmailCheckbox = e}
                 defaultChecked={this.props.settings.reciepts.loans.email} />
          <FormattedMessage {...messages.loanReciept} /><br />
          <input type='checkbox' ref={e => this.recieptOnReturnsEmailCheckbox = e}
                 defaultChecked={this.props.settings.reciepts.returns.email} />
          <FormattedMessage {...messages.returnReciept} />
        </div>
        <div style={{display: 'inline-block', width: '100%'}}>
          <button onClick={this.handleSaveClick}><FormattedMessage {...messages.save} /></button>
        </div>
        <hr />
        <div>
          <h3><FormattedMessage {...messages.changePin} /></h3>
          <p><FormattedMessage {...messages.pinInfo} /></p>
          <FormattedMessage {...messages.currentPin} /><br />
          <input type='text' /><br />
          <FormattedMessage {...messages.newPin} /><br />
          <input type='text' /><br />
          <FormattedMessage {...messages.repeatPin} /><br />
          <input type='text' /><br />
          <button><FormattedMessage {...messages.changePin} /><br /></button>
        </div>
      </div>
    )
  }
})

const messages = defineMessages({
  alerts: {
    id: 'UserSettings.alerts',
    description: 'The alerts header',
    defaultMessage: 'Alerts'
  },
  reminderOfDueDate: {
    id: 'UserSettings.reminderOfDueDate',
    description: 'The label for the reminder of due date options',
    defaultMessage: 'Reminder of due date?'
  },
  reminderOfPickup: {
    id: 'UserSettings.reminderOfPickup',
    description: 'The label for the reminder of pickup options',
    defaultMessage: 'Reminder of pickup?'
  },
  reciepts: {
    id: 'UserSettings.reciepts',
    description: 'The reciepts header',
    defaultMessage: 'Reciepts'
  },
  loanReciept: {
    id: 'UserSettings.loanReciept',
    description: 'The label for the option to receive loan reciepts by email',
    defaultMessage: 'Receive a reciept for loans by email'
  },
  returnReciept: {
    id: 'UserSettings.returnReciept',
    description: 'The label for the option to receive return reciepts by email',
    defaultMessage: 'Receive a reciept for returns by email'
  },
  save: {
    id: 'UserSettings.save',
    description: 'The label for the save button',
    defaultMessage: 'Save'
  },
  freeNotification: {
    id: 'UserSettings.freeNotification',
    description: 'The message to notify users that reciepts and alerts are free',
    defaultMessage: 'Notice! All alerts and reciepts are free'
  },
  bySms: {
    id: 'UserSettings.bySms',
    description: 'The label for the by SMS option',
    defaultMessage: 'By SMS'
  },
  byEmail: {
    id: 'UserSettings.byEmail',
    description: 'The label for the by email option',
    defaultMessage: 'By email'
  },
  changePin: {
    id: 'UserSettings.changePin',
    description: 'The change PIN code header and button text',
    defaultMessage: 'Change PIN code'
  },
  pinInfo: {
    id: 'UserSettings.pinInfo',
    description: 'Important information about PIN codes',
    defaultMessage: 'Important information, read this: New passwords must be provided in the form of a 4 digit PIN code. Do not use PIN codes that you have used other places. Choose a PIN code that noone can guess. Avoid PINs such as 1111 and 1234.'
  },
  currentPin: {
    id: 'UserSettings.currentPin',
    description: 'The label for the current PIN input',
    defaultMessage: 'Current PIN code'
  },
  newPin: {
    id: 'UserSettings.newPin',
    description: 'The label for the new PIN input',
    defaultMessage: 'New PIN code'
  },
  repeatPin: {
    id: 'UserSettings.repeatPin',
    description: 'The label for the input where the new PIN is repeated',
    defaultMessage: 'Repeat PIN code'
  },
  settingsError: {
    id: 'UserSettings.settingsError',
    description: 'Shown when retrieving user settings failed',
    defaultMessage: 'Something went wrong retrieving user settings.'
  }
})

function mapStateToProps (state) {
  return {
    settingsError: state.profile.settingsError,
    isRequestingSettings: state.profile.isRequestingSettings,
    settings: state.profile.settings
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserSettings))
