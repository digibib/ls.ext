import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { browserHistory } from 'react-router'

import * as RegistrationActions from '../../actions/RegistrationActions'
import ValidationMessage from '../../components/ValidationMessage'
import fields from '../../../common/forms/registrationPartOne'
import validator from '../../../common/validation/validator'
import asyncValidate from '../../utils/asyncValidate'
import FormInputField from '../../components/FormInputField'
import isIe from '../../utils/isIe'

const formName = 'registrationPartOne'

class RegistrationFormPartOne extends React.Component {
  constructor (props) {
    super(props)
    this.handleKey = this.handleKey.bind(this)
    this.handleKeyToggle = this.handleKeyToggle.bind(this)
  }

  handleKey (event) {
    if (event.keyCode === 32) { // Space for checkbox
      browserHistory.goBack
    }
  }

  handleKeyToggle (event) {
    if (event.keyCode === 32) { // Space for checkbox
      event.preventDefault()
      this.props.registrationActions.showSSNInfo()
    }
  }

  renderSSNInfo () {
    return (
      <p data-automation-id="ssninfo">
        <FormattedMessage {...messages.ssnInfo} />
      </p>
    )
  }

  renderCheckingForExistingUser () {
    return (
      <p data-automation-id="checking_existing_user">
        <FormattedMessage {...messages.checkingForExistingUser} />
      </p>
    )
  }

  renderCheckForExistingUserError (message) {
    return (
      <div data-automation-id="check_for_existing_user_error">
        <p data-automation-id="check_for_existing_user_error_message">
          {messages[ message ]
            ? <FormattedMessage {...messages[ message ]} />
            : <FormattedMessage {...messages.genericRegistrationError} />}
        </p>
      </div>
    )
  }

  renderContinueAndCancelButtons (submitting) {
    return (
      <p>
        <button className="blue-btn" type="submit" disabled={submitting || this.hasInvalidFormFields()}
                data-automation-id="check_existing_user_button">
          <FormattedMessage {...messages.checkForExistingUser} />
        </button>
        <a role="button" tabIndex="0" className="cancel-link" onKeyDown={this.handleKey} onClick={browserHistory.goBack} title="cancel"><FormattedMessage {...messages.cancel} /></a>
      </p>
    )
  }

  getValidator (field) {
    if (field.meta.touched && field.meta.error) {
      return <div className="feedback"><ValidationMessage message={field.meta.error} /></div>
    }
  }

  hasInvalidFormFields () {
    return Object.values(this.props.fields).every(field => field.error)
  }

  isNotEmpty () {
    return Object.values(this.props.fields).every(field => field.touched)
  }

  render () {
    const { submitting } = this.props

    return (
      <form onSubmit={this.props.handleSubmit(this.props.registrationActions.checkForExistingUser)}>
        <h1><FormattedMessage {...messages.registerAsLoaner} /></h1>
        {/* IE11-hack begin: Make the first fieldset with firstName and lastName display with correct width */}
        {isIe() ? <fieldset style={{ visibility: 'hidden' }}><input /></fieldset> : null}
        {/* IE11-hack end */}
        <div disabled={this.props.checkForExistingUserSuccess}>
          <legend><FormattedMessage {...messages.nameLabel} /></legend>
          <FormInputField name="firstName" message={messages.firstName} formName={formName}
                          getValidator={this.getValidator} />
          <FormInputField name="lastName" message={messages.lastName} formName={formName}
                          getValidator={this.getValidator} />
        </div>
        <div disabled={this.props.checkForExistingUserSuccess}>
          <legend><FormattedMessage {...messages.birthdate} /></legend>
          <div className="date-of-birth">
            <FormInputField name="day" message={messages.day} formName={formName} getValidator={this.getValidator} />
            <FormInputField name="month" message={messages.month} formName={formName}
                            getValidator={this.getValidator} />
            <FormInputField name="year" message={messages.year} formName={formName} getValidator={this.getValidator} />
          </div>
        </div>
        <div disabled={this.props.checkForExistingUserSuccess}>
          <legend><FormattedMessage {...messages.ssnHeader} /></legend>
          <FormInputField name="ssn" message={messages.ssn} formName={formName} getValidator={this.getValidator} />
          <p>
            <a role="button" tabIndex="0" aria-expanded={this.props.showSSNInfo} onKeyDown={this.handleKeyToggle} onClick={this.props.registrationActions.showSSNInfo} title="ssnLink">
              <FormattedMessage {...messages.ssnLink} />
            </a>
          </p>
          {this.props.showSSNInfo ? this.renderSSNInfo() : ''}
          {this.props.isCheckingForExistingUser ? this.renderCheckingForExistingUser() : ''}
          {/* TODO: also handle all fields empty */}
          {this.props.checkForExistingUserSuccess ? null : this.renderContinueAndCancelButtons(submitting)}
        </div>
        {this.props.checkForExistingUserFailure ? this.renderCheckForExistingUserError(this.props.registrationError) : ''}
      </form>
    )
  }
}

export const messages = defineMessages({
  genericRegistrationError: {
    id: 'RegistrationFormPartOne.genericRegistrationError',
    description: 'Error message when registering',
    defaultMessage: 'Some error occurred during registering. Please try again later.'
  },
  checkForExistingUser: {
    id: 'RegistrationFormPartOne.checkForExistingUser',
    description: 'The user validation button in registration form',
    defaultMessage: 'Continue'
  },
  checkingForExistingUser: {
    id: 'RegistrationFormPartOne.checkingForExistingUser',
    description: 'The message when checking against already registered users',
    defaultMessage: 'Checking agains existing user base...'
  },
  checkForExistingUserSuccess: {
    id: 'RegistrationFormPartOne.checkForExistingUserSuccess',
    description: 'The message when check against already registered users succeeds',
    defaultMessage: 'No existing user found, please continue registering a new user.'
  },
  userExistsInLocalDB: {
    id: 'RegistrationFormPartOne.userExistsInLocalDB',
    description: 'Message displayed to user when already registered locally',
    defaultMessage: 'User seems to be already registered at this library. Please contact library to get credentials'
  },
  userExistsInCentralDB: {
    id: 'RegistrationFormPartOne.userExistsInCentralDB',
    description: 'Message displayed to user when already registered in the Norwegian Patron DB',
    defaultMessage: 'You are already registered in the Norwegian Patron Database. Please come by a library to pick up a new library card.'
  },
  cancel: {
    id: 'RegistrationFormPartOne.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  registerAsLoaner: {
    id: 'RegistrationFormPartOne.registerAsLoaner',
    description: 'The header text of the modal dialog',
    defaultMessage: 'Register as loaner'
  },
  nameLabel: {
    id: 'RegistrationFormPartOne.nameLabel',
    description: 'Label for the fieldset (legend) names',
    defaultMessage: 'Name'
  },
  firstName: {
    id: 'RegistrationFormPartOne.firstName',
    description: 'Label for the first name field',
    defaultMessage: 'First name'
  },
  lastName: {
    id: 'RegistrationFormPartOne.lastName',
    description: 'Label for the last name field',
    defaultMessage: 'Last name'
  },
  personInfoLegend: {
    id: 'RegistrationFormPartOne.personInfoLegend',
    description: 'Fieldset legend for personal information',
    defaultMessage: 'Personal information'
  },
  birthdate: {
    id: 'RegistrationFormPartOne.birthdate',
    description: 'Label for birthdate',
    defaultMessage: 'Birthdate'
  },
  day: {
    id: 'RegistrationFormPartOne.day',
    description: 'Label for the day field',
    defaultMessage: 'Day'
  },
  month: {
    id: 'RegistrationFormPartOne.month',
    description: 'Label for the month field',
    defaultMessage: 'Month'
  },
  year: {
    id: 'RegistrationFormPartOne.year',
    description: 'Label for the year field',
    defaultMessage: 'Year'
  },
  ssnHeader: {
    id: 'RegistrationFormPartOne.ssnHeader',
    description: 'Header for input field social security number',
    defaultMessage: 'Social security number'
  },
  ssn: {
    id: 'RegistrationFormPartOne.ssnSpec',
    description: 'Specification of social security number',
    defaultMessage: 'National ID number (11 digits)/D-nr./DUF-nr.'
  },
  ssnLabel: {
    id: 'RegistrationFormPartOne.ssnLabel',
    description: 'Label(s) for social security number',
    defaultMessage: 'National ID number (11 digits)/D-nr./DUF.nr.'
  },
  ssnLink: {
    id: 'RegistrationFormPartOne.ssnLink',
    description: 'Link label for info on ssn',
    defaultMessage: 'Why do I need to fill in birth date and Social security number?'
  },
  ssnInfo: {
    id: 'RegistrationFormPartOne.ssnInfo',
    description: 'Expanded info on ssn',
    defaultMessage: 'The birth date determines wich items you can borrow and what rights you have. The SSN tells us who you are and ensures that no one can abuse your identity. All data is stored and processed according to current laws.'
  }
})

RegistrationFormPartOne.propTypes = {
  dispatch: PropTypes.func.isRequired,
  registrationActions: PropTypes.object.isRequired,
  fields: PropTypes.object,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  asyncValidating: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.bool
  ]).isRequired,
  username: PropTypes.string,
  message: PropTypes.string,
  isError: PropTypes.bool,
  isSuccess: PropTypes.bool,
  isCheckingForExistingUser: PropTypes.bool,
  checkForExistingUserSuccess: PropTypes.bool,
  checkForExistingUserFailure: PropTypes.bool,
  registrationError: PropTypes.string,
  showSSNInfo: PropTypes.bool,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    libraries: state.application.libraries,
    showSSNInfo: state.registration.showSSNInfo,
    isCheckingForExistingUser: state.registration.isCheckingForExistingUser,
    checkForExistingUserSuccess: state.registration.checkForExistingUserSuccess,
    checkForExistingUserFailure: state.registration.checkForExistingUserFailure,
    registrationError: state.registration.registrationError,
    initialValues: {},
    fields: state.form.registrationPartOne ? state.form.registrationPartOne : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    registrationActions: bindActionCreators(RegistrationActions, dispatch)
  }
}

const intlRegistrationFormPartOne = injectIntl(RegistrationFormPartOne)
export { intlRegistrationFormPartOne as RegistrationFormPartOne }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({
  form: formName,
  asyncValidate,
  asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
  validate: validator(fields)
})(intlRegistrationFormPartOne))
