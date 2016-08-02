import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as RegistrationActions from '../../actions/RegistrationActions'
import * as ModalActions from '../../actions/ModalActions'
import ValidationMessage from '../../components/ValidationMessage'
import fields from '../../../common/forms/registrationPartOne'
import validator from '../../../common/validation/validator'
import asyncValidate from '../../utils/asyncValidate'

class RegistrationFormPartOne extends React.Component {
  constructor (props) {
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSSNInfo () {
    return (
      <div data-automation-id="ssninfo">
        <span className="display-inline">
          <FormattedMessage {...messages.ssnInfo} />
        </span>
      </div>
    )
  }

  renderCheckingForExistingUser () {
    return (
      <div data-automation-id="checking_existing_user">
        <span className="display-inline">
          <FormattedMessage {...messages.checkingForExistingUser} />
        </span>
      </div>
    )
  }

  renderCheckForExistingUserSuccess () {
    return (
      <div data-automation-id="check_for_existing_user_success">
        <span className="display-inline">
          <FormattedMessage {...messages.checkForExistingUserSuccess} />
        </span>
      </div>
    )
  }

  getValidator (field) {
    if (field.touched && field.error) {
      return <div style={{ color: 'red' }}><ValidationMessage message={field.error} /></div>
    }
  }

  hasInvalidFormFields () {
    return Object.values(this.props.fields).every(field => field.error)
  }

  isNotEmpty () {
    return Object.values(this.props.fields).every(field => field.touched)
  }

  render () {
    const {
      fields: {
        firstName, lastName, day, month, year, ssn
      }, submitting
    } = this.props
    return (
      <form onSubmit={this.props.handleSubmit(this.props.registrationActions.checkForExistingUser)}>
        <fieldset disabled={this.props.checkForExistingUserSuccess}>
          <h1><FormattedMessage {...messages.registerAsLoaner} /></h1>
          <span className="display-inline">
                  <h2><FormattedMessage {...messages.firstName} /></h2>
                  <input name="firstname" type="text" id="firstname" {...firstName} />
                  <label htmlFor="name"><FormattedMessage {...messages.firstName} /></label>
            {this.getValidator(firstName)}
                </span>
          <span className="display-inline">
                  <h2><FormattedMessage {...messages.lastName} /></h2>
                  <input name="lastname" type="text" id="lastname" {...lastName} />
                  <label htmlFor="lastname"><FormattedMessage {...messages.lastName} /></label>
            {this.getValidator(lastName)}
                </span>
        </fieldset>
        <fieldset disabled={this.props.checkForExistingUserSuccess}>
          <legend><FormattedMessage {...messages.personInfoLegend} /></legend>
          <div className="date-of-birth">
            <div className="item">
              <h2><FormattedMessage {...messages.day} /></h2>
              <input name="day" type="number" id="day" {...day} />
              <label htmlFor="day"><FormattedMessage {...messages.day} /></label>
              {this.getValidator(day)}
            </div>
            <div className="item">
              <h2><FormattedMessage {...messages.month} /></h2>
              <input name="month" type="number" id="month" {...month} />
              <label htmlFor="month"><FormattedMessage {...messages.month} /></label>
              {this.getValidator(month)}
            </div>
            <div className="item">
              <h2><FormattedMessage {...messages.year} /></h2>
              <input name="year" type="number" id="year" {...year} />
              <label htmlFor="year"><FormattedMessage {...messages.year} /></label>
              {this.getValidator(year)}
            </div>
          </div>
          <div className="ssn-info">
            <h3><a onClick={this.props.registrationActions.showSSNInfo}
                   title="ssnLink"><FormattedMessage {...messages.ssnLink} /></a>
            </h3>
            {this.props.showSSNInfo ? this.renderSSNInfo() : ''}
          </div>
          <span className="display-inline">
                  <h2><FormattedMessage {...messages.ssnHeader} /></h2>
                  <input name="ssn" type="text" id="ssn" {...ssn} />
                  <label htmlFor="ssn"><FormattedMessage {...messages.ssnLabel} /></label>
            {this.getValidator(ssn)}
                </span>
          {this.props.isCheckingForExistingUser ? this.renderCheckingForExistingUser() : ''}
          {/* TODO: also handle all fields empty */}

          <button className="black-btn" type="submit" disabled={submitting || this.hasInvalidFormFields()}
                  data-automation-id="check_existing_user_button">
            <FormattedMessage {...messages.checkForExistingUser} />
          </button>

          <h3><a onClick={this.handleCancel} title="cancel"><FormattedMessage {...messages.cancel} /></a></h3>
        </fieldset>
        {this.props.checkForExistingUserSuccess ? this.renderCheckForExistingUserSuccess() : ''}
      </form>
    )
  }
}

const messages = defineMessages({
  checkForExistingUser: {
    id: 'RegistrationFormPartOne.checkForExistingUser',
    description: 'The user validation button in registration form',
    defaultMessage: 'Validate'
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
    defaultMessage: 'User seems to be already registered in the Norwegian Patron Database. Please contact library to get credentials'
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
    defaultMessage: 'ID-number'
  },
  ssnLabel: {
    id: 'RegistrationFormPartOne.ssnLabel',
    description: 'Label(s) for social security number',
    defaultMessage: 'SSN/D-nr./DUF.nr.'
  },
  ssnLink: {
    id: 'RegistrationFormPartOne.ssnLink',
    description: 'Link label for info on ssn',
    defaultMessage: 'Why do I need to fill in birth date and Social security number?'
  },
  ssnInfo: {
    id: 'RegistrationFormPartOne.ssnInfo',
    description: 'Expanded info on ssn',
    defaultMessage: 'SSN is your personal Social security number. It is either ... etc'
  }
})

RegistrationFormPartOne.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  registrationActions: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
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
  showSSNInfo: PropTypes.bool,
  showTermsAndConditions: PropTypes.bool,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    loginError: state.application.loginError,
    libraries: state.application.libraries,
    showSSNInfo: state.registration.showSSNInfo,
    showTermsAndConditions: state.registration.showTermsAndConditions,
    isCheckingForExistingUser: state.registration.isCheckingForExistingUser,
    checkForExistingUserSuccess: state.registration.checkForExistingUserSuccess,
    initialValues: {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    registrationActions: bindActionCreators(RegistrationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

const intlRegistrationFormPartOne = injectIntl(RegistrationFormPartOne)
export { intlRegistrationFormPartOne as RegistrationFormPartOne }

export default reduxForm(
  {
    form: 'registrationPartOne',
    fields: Object.keys(fields),
    asyncValidate,
    asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
    validate: validator(fields)
  },
  mapStateToProps,
  mapDispatchToProps
)(intlRegistrationFormPartOne)
