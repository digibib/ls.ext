import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import * as ProfileActions from '../actions/ProfileActions'
import ChangePin from './ChangePin'

class UserSettings extends React.Component {
  constructor (props) {
    super(props)
    this.handleSaveClick = this.handleSaveClick.bind(this)
  }

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
  }

  render () {
    const { settings } = this.props
    if (this.props.isRequestingSettings || Object.keys(settings).length === 0) {
      return <div />
    } else if (this.props.settingsError) {
      return <FormattedMessage {...messages.settingsError} />
    }
    return (
      <div className="user-settings">

        <header>
          <h1><FormattedMessage {...messages.alerts} /></h1>
        </header>

        <section className="user-reminders">
          <div className="reminders col">
            <h2><FormattedMessage {...messages.reminderOfDueDate} /></h2>

            <ul>
              <li>

                <input data-automation-id="UserSettings_reminderOfDueDateSms"
                       type="checkbox" name="user-settings-sms-reminder" id="user-settings-sms-reminder"
                       ref={e => this.reminderOfDueDateSmsCheckbox = e}
                       defaultChecked={settings.alerts.reminderOfDueDate.sms} />
                <label htmlFor="user-settings-sms-reminder"><span></span>
                  <FormattedMessage {...messages.bySms} /></label>

              </li>
              <li>

                <input data-automation-id="UserSettings_reminderOfDueDateEmail"
                       type="checkbox" name="user-settings-reminder-email"
                       id="user-settings-reminder-email"
                       ref={e => this.reminderOfDueDateEmailCheckbox = e}
                       defaultChecked={settings.alerts.reminderOfDueDate.email} />
                <label
                  htmlFor="user-settings-reminder-email"><span></span>
                  <FormattedMessage {...messages.byEmail} /></label>

              </li>
              {/* <li className="patron-placeholder">

               <input data-automation-id="??"
               type="checkbox" name="user-settings-reminder-dont-send"
               id="user-settings-reminder-dont-send"
               ref={e => this.reminderOfDueDateEmailCheckbox = e}
               defaultChecked={settings.alerts.reminderOfDueDate.email} />
               <label
               htmlFor="user-settings-reminder-email"><span></span>
               <span>Nei, ikke send</span></label>

               </li> */}
            </ul>
          </div>

          <div className="reminders col">
            <h2><FormattedMessage {...messages.reminderOfPickup} /></h2>
            <ul>
              <li>

                <input data-automation-id="UserSettings_reminderOfPickupSms"
                       type="checkbox" name="user-settings-delivery-reminder-sms"
                       id="user-settings-delivery-reminder-sms"
                       ref={e => this.reminderOfPickupSmsCheckbox = e}
                       defaultChecked={settings.alerts.reminderOfPickup.sms} />
                <label htmlFor="user-settings-delivery-reminder-sms"><span></span>
                  <FormattedMessage {...messages.bySms} /></label>
              </li>
              <li>
                <input data-automation-id="UserSettings_reminderOfPickupEmail"
                       type="checkbox" name="user-settings-delivery-reminder-email"
                       id="user-settings-delivery-reminder-email"
                       ref={e => this.reminderOfPickupEmailCheckbox = e}
                       defaultChecked={settings.alerts.reminderOfPickup.email} />
                <label htmlFor="user-settings-delivery-reminder-email"><span></span>
                  <FormattedMessage {...messages.byEmail} /></label>
              </li>
            </ul>
          </div>

          <div className="reciept col">
            <h2><FormattedMessage {...messages.reciepts} /></h2>
            <ul>
              <li>
                <input data-automation-id="UserSettings_recieptOnLoansEmail"
                       type="checkbox" name="reciept-loans-email" id="reciept-loans-email"
                       ref={e => this.recieptOnLoansEmailCheckbox = e}
                       defaultChecked={settings.reciepts.loans.email} />
                <label htmlFor="reciept-loans-email"><span></span>
                  <FormattedMessage {...messages.loanReciept} /></label>
              </li>
              <li>
                <input data-automation-id="UserSettings_recieptOnReturnsEmail"
                       type="checkbox" name="reciept-returns-email" id="reciept-returns-email"
                       ref={e => this.recieptOnReturnsEmailCheckbox = e}
                       defaultChecked={settings.reciepts.returns.email} />
                <label htmlFor="reciept-returns-email"><span></span>
                  <FormattedMessage {...messages.returnReciept} /></label>
              </li>
            </ul>
          </div>
        </section>

        <footer>
          <button className="black-btn" type="button" data-automation-id="UserSettings_saveButton"
                  onClick={this.handleSaveClick}><FormattedMessage {...messages.save} /></button>
        </footer>

        <ChangePin />
      </div>
    )
  }
}

UserSettings.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profileActions: PropTypes.object.isRequired,
  isRequestingSettings: PropTypes.bool.isRequired,
  settings: PropTypes.object.isRequired,
  settingsError: PropTypes.object
}

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
