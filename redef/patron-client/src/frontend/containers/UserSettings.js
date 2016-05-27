import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import * as ProfileActions from '../actions/ProfileActions'

class UserSettings extends React.Component {
    constructor(props) {
        super(props)
        this.handleSaveClick = this.handleSaveClick.bind(this)
    }

    handleSaveClick(event) {
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

    render() {
        if (this.props.isRequestingSettings) {
            return <div />
        } else if (this.props.settingsError) {
            return <FormattedMessage {...messages.settingsError} />
        }
        return (
            <div className='user-settings'>

                <header>
                    <h1><FormattedMessage {...messages.alerts} /></h1>
                </header>

                <section className='user-reminders'>
                    <div className='reminders col patron-placeholder'>
                        <h2><FormattedMessage {...messages.reminderOfDueDate} /></h2>

                        <ul>
                            <li>

                                <input data-automation-id='UserSettings_reminderOfDueDateSms'
                                       type='checkbox' name='user-settings-sms-reminder' id='user-settings-sms-reminder'
                                       ref={e => this.reminderOfDueDateSmsCheckbox = e}/>
                                <label for='user-settings-sms-reminder'><span></span>
                                    <FormattedMessage {...messages.bySms} /></label>

                            </li>
                            <li>

                                <input data-automation-id='UserSettings_reminderOfDueDateEmail'
                                       type='checkbox' name='user-settings-reminder-email'
                                       id='user-settings-reminder-email'
                                       ref={e => this.reminderOfDueDateEmailCheckbox = e}
                                       defaultChecked={this.props.settings.alerts.reminderOfDueDate.email}/>
                                <label
                                    for='user-settings-reminder-email'><span></span>
                                    <FormattedMessage {...messages.byEmail}/></label>

                            </li>
                            <li>

                                <input data-automation-id='??'
                                       type='checkbox' name='user-settings-reminder-dont-send'
                                       id='user-settings-reminder-dont-send'
                                       ref={e => this.reminderOfDueDateEmailCheckbox = e}
                                       defaultChecked={this.props.settings.alerts.reminderOfDueDate.email}/>
                                <label
                                    for='user-settings-reminder-email'><span></span>
                                    <span>Nei, ikke send</span></label>

                            </li>
                        </ul>
                    </div>

                    <div className='reminders col patron-placeholder'>
                        <h2><FormattedMessage {...messages.reminderOfPickup} /></h2>
                        <ul>
                            <li>

                                <input data-automation-id='UserSettings_reminderOfPickupSms'
                                       type='checkbox' name='user-settings-delivery-reminder-sms'
                                       id='user-settings-delivery-reminder-sms'
                                       ref={e => this.reminderOfPickupSmsCheckbox = e}
                                       defaultChecked={this.props.settings.alerts.reminderOfPickup.sms}/>
                                <label for='user-settings-delivery-reminder-sms'><span></span>
                                    <FormattedMessage {...messages.bySms} /></label>
                            </li>
                            <li>
                                <input data-automation-id='UserSettings_reminderOfPickupEmail'
                                       type='checkbox' name='user-settings-delivery-reminder-email'
                                       id='user-settings-delivery-reminder-email'
                                       ref={e => this.reminderOfPickupEmailCheckbox = e}
                                       defaultChecked={this.props.settings.alerts.reminderOfPickup.email}/>
                                <label for='user-settings-delivery-reminder-email'><span></span>
                                    <FormattedMessage {...messages.byEmail} /></label>
                            </li>
                        </ul>
                    </div>

                    <div className='reciept col patron-placeholder'>
                        <h2><FormattedMessage {...messages.reciepts} /></h2>
                        <ul>
                            <li>
                                <input data-automation-id='UserSettings_recieptOnLoansEmail'
                                       type='checkbox' name='reciept-loans-email' id='reciept-loans-email'
                                       ref={e => this.recieptOnLoansEmailCheckbox = e}
                                       defaultChecked={this.props.settings.reciepts.loans.email}/>
                                <label for='reciept-loans-email'><span></span>
                                    <FormattedMessage {...messages.loanReciept} /></label>
                            </li>
                            <li>
                                <input data-automation-id='UserSettings_recieptOnReturnsEmail'
                                       type='checkbox' name='reciept-returns-email' id='reciept-returns-email'
                                       ref={e => this.recieptOnReturnsEmailCheckbox = e}
                                       defaultChecked={this.props.settings.reciepts.returns.email}/>
                                <label for='reciept-returns-email'><span></span>
                                    <FormattedMessage {...messages.returnReciept} /></label>
                            </li>
                        </ul>
                    </div>
                </section>

                <footer>
                    <button className='black-btn' type="button" data-automation-id='UserSettings_saveButton'
                            onClick={this.handleSaveClick}><FormattedMessage {...messages.save} /></button>
                </footer>

                <div className='change-pin-container'>
                    <header>
                        <h1><FormattedMessage {...messages.changePin} /></h1>
                    </header>

                    <section className='change-pin'>
                        <div className="important">
                            <p><FormattedMessage {...messages.pinInfo} /></p>
                        </div>

                        <div className="change-pin-fields">
                            <h2><FormattedMessage {...messages.currentPin} /></h2>
                            <input type='text' name='current-pin' id='current-pin'/>
                            <label for='current-pin'> <FormattedMessage {...messages.currentPin} /></label>

                            <h2><FormattedMessage {...messages.newPin} /></h2>
                            <input type='text' name='new-pin' id='new-pin'/>
                            <label for='new-pin'><FormattedMessage {...messages.repeatPin} /></label>

                            <h2><FormattedMessage {...messages.repeatPin} /></h2>
                            <input type='text' name='repeat-pin' id='repeat-pin'/>
                            <label for='repeat-pin'><FormattedMessage {...messages.repeatPin} /></label>
                        </div>
                    </section>
                    <footer>
                        <button className='black-btn' type='button'><FormattedMessage {...messages.changePin} /><br /></button>
                    </footer>
                </div>
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

function mapStateToProps(state) {
    return {
        settingsError: state.profile.settingsError,
        isRequestingSettings: state.profile.isRequestingSettings,
        settings: state.profile.settings
    }
}

function mapDispatchToProps(dispatch) {
    return {
        dispatch: dispatch,
        profileActions: bindActionCreators(ProfileActions, dispatch)
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(UserSettings))
