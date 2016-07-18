import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as RegistrationActions from '../actions/RegistrationActions'
import * as ModalActions from '../actions/ModalActions'
import Libraries from '../components/Libraries'

class Registration extends React.Component {
  constructor (props) {
    super(props)
    this.handleCheckForExistingUser = this.handleCheckForExistingUser.bind(this)
    this.handleExpandedSSNInfo = this.handleExpandedSSNInfo.bind(this)
    this.handleRegistration = this.handleRegistration.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleCheckForExistingUser () {
    this.props.registrationActions.checkForExistingUser()
  }

  handleExpandedSSNInfo () {
    this.props.registrationActions.showSSNInfo()
  }

  handleRegistration () {
    this.props.registrationActions.postRegistration()
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSSNInfo () {
    return (
      <div data-automation-id="ssninfo">
        <span className="display-inline">
          <FormattedMessage {...messages.ssninfo} />
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

  renderSecondPartOfForm () {
    const {
      fields: {
        email, mobile, address, zipcode, city, country /*, gender */
      }
    } = this.props
    return (
      <fieldset>
        <legend><FormattedMessage {...messages.contactInfoLegend} /></legend>
        <span className="display-inline">
          <h2><FormattedMessage {...messages.email} /></h2>
          <input name="email" type="text" id="email" {...email} />
          <label htmlFor="email"><FormattedMessage {...messages.email} /></label>
          {this.getValidator(email)}
        </span>
        <span className="display-inline">
          <h2><FormattedMessage {...messages.mobile} /></h2>
          <input name="mobile" type="text" id="mobile" {...mobile} />
          <label htmlFor="mobile"><FormattedMessage {...messages.mobile} /></label>
          {this.getValidator(mobile)}
        </span>
        <address>
          <h2><FormattedMessage {...messages.address} /></h2>
          <input name="address" type="text" id="address" {...address} />
          <label htmlFor="address"><FormattedMessage {...messages.address} /></label>
          {this.getValidator(address)}
          <span className="display-inline">
            <h2><FormattedMessage {...messages.zipcode} /></h2>
            <input name="zipcode" type="text" id="zipcode" {...zipcode} />
            <label htmlFor="zipcode"><FormattedMessage {...messages.zipcode} /></label>
            {this.getValidator(zipcode)}
          </span>
          <span className="display-inline">
            <h2><FormattedMessage {...messages.city} /></h2>
            <input name="city" type="text" id="city" {...city} />
            <label htmlFor="city"><FormattedMessage {...messages.city} /></label>
            {this.getValidator(city)}
          </span>
          <h2><FormattedMessage {...messages.country} /></h2>
          <label htmlFor="country"><FormattedMessage {...messages.country} /></label>
          <input name="country" type="text" id="country" {...country} />
          {this.getValidator(country)}
        </address>
        {/*
        <h2><FormattedMessage {...messages.gender} /></h2>
        <div className="select-container">
          <select data-automation-id="gender_selection" >
            <option value="male"><FormattedMessage {...messages.male} /></option>
            <option value="female"><FormattedMessage {...messages.female} /></option>
          </select>
        </div>
        */}
      </fieldset>
    )
  }

  renderThirdPartOfForm () {
    const {
      fields: {pin, repeatPin, library, acceptTerms},
      submitting
    } = this.props
    return (
      <fieldset>
        <legend><FormattedMessage {...messages.personSettingsLegend} /></legend>
        <h2><FormattedMessage {...messages.choosePin} /></h2>
        <input data-automation-id="choose_pin" name="code" type="password" id="code" {...pin} />
        <label htmlFor="code"><FormattedMessage {...messages.choosePin} /></label>
        <input data-automation-id="repeat_pin" name="code" type="password" id="code" {...repeatPin} />
        <label htmlFor="code"><FormattedMessage {...messages.repeatPin} /></label>
        {this.getValidator(pin)}
        {this.getValidator(repeatPin)}
        <h2><FormattedMessage {...messages.chooseBranch} /></h2>
        <div className="select-container">
          <Libraries libraries={this.props.libraries} selectProps={library} />
        </div>
        {/*
        <div className="display-inline">
          <h2><FormattedMessage {...messages.rememberHistory} /></h2>
          <input name="yes" type="radio" id="yes" />
          <p className="display-inline"><FormattedMessage {...messages.yesOption} /></p>
          <label htmlFor="yes"><FormattedMessage {...messages.yesOption} /></label>
          <input name="no" type="radio" id="no" />
          <p className="display-inline"><FormattedMessage {...messages.noOption} /></p>
          <label htmlFor="code"><FormattedMessage {...messages.noOption} /></label>
        </div>
        */}
        <div className="terms_and_conditions">
          <input data-automation-id="accept_terms" id="acceptTerms" type="checkbox" {...acceptTerms} />
          <label htmlFor="accept_terms"><span></span>
            <a onClick={this.handleExpandedTermsAndCondition} title="termslink">
              <FormattedMessage {...messages.acceptTermsLink} />
            </a>
          </label>
          {this.props.showTermsAndConditions ? this.renderTermsAndConditions() : ''}
        </div>
        <button className="black-btn" type="submit" disabled={submitting || this.hasInvalidFormFields()}
                data-automation-id="register_button">
          <FormattedMessage {...messages.register} />
        </button>
        <h3><a onClick={this.handleCancel} title="cancel"><FormattedMessage {...messages.cancel} /></a></h3>
      </fieldset>
    )
  }

  renderSuccess () {
    return (
      <div data-automation-id="registration_success_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
        <p>
          <FormattedMessage {...messages.messageSuccess} /><br />
          <span data-automation-id="username">{this.props.username}</span>
        </p>
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id="registration_error_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericRegistrationError} />}
        </p>
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  getValidator (field) {
    if (field.touched && field.error) {
      return <div style={{color: 'red'}}>{this.props.intl.formatMessage(field.error)}</div>
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
      }
    } = this.props
    if (this.props.isError) {
      return this.renderError()
    } else if (this.props.isSuccess) {
      return this.renderSuccess()
    }
    return (
      <div>
        <section className="register-modal">
          <div data-automation-id="registration_modal">
            <form onSubmit={this.props.handleSubmit(this.handleRegistration)}>
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
                   <h3><a onClick={this.handleExpandedSSNInfo} title="ssnlink"><FormattedMessage {...messages.ssnlink} /></a></h3>
                   {this.props.showSSNInfo ? this.renderSSNInfo() : ''}
                </div>
                <span className="display-inline">
                  <h2><FormattedMessage {...messages.ssnheader} /></h2>
                  <input name="ssn" type="text" id="ssn" {...ssn} />
                  <label htmlFor="ssn"><FormattedMessage {...messages.ssnlabel} /></label>
                  {this.getValidator(ssn)}
                </span>
                {this.props.isCheckingForExistingUser ? this.renderCheckingForExistingUser() : ''}
                {/* TODO: also handle all fields empty */}
                <button className="black-btn" onClick={this.handleCheckForExistingUser} disabled={this.hasInvalidFormFields()}
                        data-automation-id="check_existing_user_button">
                  <FormattedMessage {...messages.checkForExistingUser} />
                </button>
                <h3><a onClick={this.handleCancel} title="register">Avbryt</a></h3>
              </fieldset>
              {this.props.checkForExistingUserSuccess ? this.renderCheckForExistingUserSuccess() : ''}
              {this.props.checkForExistingUserSuccess && !this.hasInvalidFormFields() ? this.renderSecondPartOfForm() : ''}
              {this.props.checkForExistingUserSuccess && !this.hasInvalidFormFields() ? this.renderThirdPartOfForm() : ''}
            </form>
          </div>
        </section>
      </div>
    )
  }
}

const messages = defineMessages({
  button: {
    id: 'Registration.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'Close'
  },
  registration: {
    id: 'Registration.registration',
    description: 'The extend loan button text',
    defaultMessage: 'Register'
  },
  checkForExistingUser: {
    id: 'Registration.checkForExistingUser',
    description: 'The user validation button in registration form',
    defaultMessage: 'Validate'
  },
  checkingForExistingUser: {
    id: 'Registration.checkingForExistingUser',
    description: 'The message when checking against already registered users',
    defaultMessage: 'Checking agains existing user base...'
  },
  checkForExistingUserSuccess: {
    id: 'Registration.checkForExistingUserSuccess',
    description: 'The message when check against already registered users succeeds',
    defaultMessage: 'No existing user found, please continue registering a new user.'
  },
  userExistsInLocalDB: {
    id: 'Registration.userExistsInLocalDB',
    description: 'Message displayed to user when already registered locally',
    defaultMessage: 'User seems to be already registered at this library. Please contact library to get credentials'
  },
  userExistsInCentralDB: {
    id: 'Registration.userExistsInCentralDB',
    description: 'Message displayed to user when already registered in the Norwegian Patron DB',
    defaultMessage: 'User seems to be already registered in the Norwegian Patron Database. Please contact library to get credentials'
  },
  validate: {
    id: 'Registration.validate',
    description: 'The validate user button in registration form',
    defaultMessage: 'Validate'
  },
  cancel: {
    id: 'Registration.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'Registration.headerTextSuccess',
    description: 'The header text for the extend loan success dialog',
    defaultMessage: 'Success!'
  },
  messageSuccess: {
    id: 'Registration.messageSuccess',
    description: 'The extend loan success message',
    defaultMessage: 'You have successfully registered. A temporary user id is given below. Please contact library to get a library card.'
  },
  headerTextError: {
    id: 'Registration.headerTextError',
    description: 'The header text for the extend loan error dialog',
    defaultMessage: 'Failure'
  },
  genericRegistrationError: {
    id: 'Registration.genericRegistrationError',
    description: 'A generic message when extending the loan goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Something went wrong when registering loaner. Please try again later.'
  },
  registerAsLoaner: {
    id: 'Registration.registerAsLoaner',
    description: 'The header text of the modal dialog',
    defaultMessage: 'Register as loaner'
  },
  firstName: {
    id: 'Registration.firstName',
    description: 'Label for the first name field',
    defaultMessage: 'First name'
  },
  lastName: {
    id: 'Registration.lastName',
    description: 'Label for the last name field',
    defaultMessage: 'Last name'
  },
  day: {
    id: 'Registration.day',
    description: 'Label for the day field',
    defaultMessage: 'Day'
  },
  month: {
    id: 'Registration.month',
    description: 'Label for the month field',
    defaultMessage: 'Month'
  },
  year: {
    id: 'Registration.year',
    description: 'Label for the year field',
    defaultMessage: 'Year'
  },
  ssnheader: {
    id: 'Registration.ssnheader',
    description: 'Header for input field social security number',
    defaultMessage: 'ID-number'
  },
  ssnlabel: {
    id: 'Registration.ssnlabel',
    description: 'Label(s) for social security number',
    defaultMessage: 'SSN/D-nr./DUF.nr.'
  },
  ssnlink: {
    id: 'Registration.ssnlink',
    description: 'Link label for info on ssn',
    defaultMessage: 'Why do I need to fill in birth date and Social security number?'
  },
  ssninfo: {
    id: 'Registration.ssninfo',
    description: 'Expanded info on ssn',
    defaultMessage: 'SSN is your personal Social security number. It is either ... etc'
  },
  email: {
    id: 'Registration.email',
    description: 'Label for the email field',
    defaultMessage: 'Email'
  },
  mobile: {
    id: 'Registration.mobile',
    description: 'Label for the mobile field',
    defaultMessage: 'Mobile'
  },
  address: {
    id: 'Registration.address',
    description: 'Label for the address field',
    defaultMessage: 'Address'
  },
  zipcode: {
    id: 'Registration.zipcode',
    description: 'Label for the zipcode field',
    defaultMessage: 'Zipcode'
  },
  city: {
    id: 'Registration.city',
    description: 'Label for the city field',
    defaultMessage: 'City'
  },
  country: {
    id: 'Registration.country',
    description: 'Label for the country field',
    defaultMessage: 'Country'
  },
  gender: {
    id: 'Registration.gender',
    description: 'Label for the gender field',
    defaultMessage: 'Gender'
  },
  male: {
    id: 'Registration.male',
    description: 'Label for the male gender',
    defaultMessage: 'Male'
  },
  female: {
    id: 'Registration.female',
    description: 'Label for the female gender',
    defaultMessage: 'Female'
  },
  pin: {
    id: 'Registration.pin',
    description: 'Label for the pin field',
    defaultMessage: 'Pin'
  },
  choosePin: {
    id: 'Registration.choosePin',
    description: 'Label for choosing pin field',
    defaultMessage: 'Velg deg en pin kode'
  },
  repeatPin: {
    id: 'Registration.repeatPin',
    description: 'Label for repeating chosen pin field',
    defaultMessage: 'Bekreft PIN'
  },
  history: {
    id: 'Registration.history',
    description: 'Label for the history field',
    defaultMessage: 'History'
  },
  register: {
    id: 'Registration.register',
    description: 'The register button text',
    defaultMessage: 'Register'
  },
  required: {
    id: 'Registration.required',
    description: 'Displayed below a field when not filled out',
    defaultMessage: 'Required'
  },
  invalidEmail: {
    id: 'Registration.invalidEmail',
    description: 'Displayed when the email is not valid',
    defaultMessage: 'Invalid email address'
  },
  invalidYear: {
    id: 'Registration.invalidYear',
    description: 'Displayed when the year is not valid',
    defaultMessage: 'Invalid year'
  },
  invalidMonth: {
    id: 'Registration.invalidMonth',
    description: 'Displayed when the month is not valid',
    defaultMessage: 'Invalid month'
  },
  invalidDay: {
    id: 'Registration.invalidDay',
    description: 'Displayed when the day is not valid',
    defaultMessage: 'Invalid day'
  },
  pinMustBeEqual: {
    id: 'Registration.pinsMustBeEqual',
    description: 'Displayed when the pin and repeat pin is not equal',
    defaultMessage: 'PINs must be equal'
  },
  personInfoLegend: {
    id: 'Registration.personInfoLegend',
    description: 'Fieldset legend for personal information',
    defaultMessage: 'Personal information'
  },
  contactInfoLegend: {
    id: 'Registration.contactInfoLegend',
    description: 'Fieldset legend for contact information',
    defaultMessage: 'Contact information'
  },
  personSettingsLegend: {
    id: 'Registration.personSettingsLegend',
    description: 'Fieldset legend for personal settings',
    defaultMessage: 'Personal settings'
  },
  yesOption: {
    id: 'Registration.yesOption',
    description: 'Affirmative select option',
    defaultMessage: 'Yes'
  },
  noOption: {
    id: 'Registration.noOption',
    description: 'Negative select option',
    defaultMessage: 'No'
  },
  chooseBranch: {
    id: 'Registration.chooseBranch',
    description: 'Choose home branch label',
    defaultMessage: 'Choose Your Home Branch'
  },
  rememberHistory: {
    id: 'Registration.rememberHistory',
    description: 'Toggle for choice to remember Loans',
    defaultMessage: 'Remember Loans (history)'
  },
  acceptTermsLink: {
    id: 'Registration.acceptTermsLink',
    description: 'Link text for Terms and Conditions',
    defaultMessage: 'Accept Terms and Conditions'
  }
})

Registration.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  registrationActions: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  libraries: PropTypes.object.isRequired,
  submitting: PropTypes.bool.isRequired,
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
    initialValues: {
      library: Object.keys(state.application.libraries)[ 0 ] // Makes sure this field has a value even if it is not touched
    }
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    registrationActions: bindActionCreators(RegistrationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

const intlRegistration = injectIntl(Registration)
export { intlRegistration as Registration }

const validate = values => {
  const errors = {}
  if (!values.firstName) {
    errors.firstName = messages.required
  }
  if (!values.lastName) {
    errors.lastName = messages.required
  }
  if (!values.year) {
    errors.year = messages.required
  } else if (values.year < 1900 || values.year > new Date().getFullYear() - 5) { /* What is the actual requirements for age? */
    errors.year = messages.invalidYear
  }
  if (!values.month) {
    errors.month = messages.required
  } else if (values.month < 1 || values.month > 13) {
    errors.month = messages.invalidMonth
  }
  if (!values.day) {
    errors.day = messages.required
  } else if (values.day < 1 || values.day > 31) { /* TODO: Regular date check? */
    errors.day = messages.invalidDay
  }
  if (!values.email) {
    errors.email = messages.required
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = messages.invalidEmail
  }
  if (!values.ssn) {
    errors.ssn = messages.required
  }
  if (!values.mobile) {
    errors.mobile = messages.required
  }
  if (!values.address) {
    errors.address = messages.required
  }
  if (!values.zipcode) {
    errors.zipcode = messages.required
  }
  if (!values.city) {
    errors.city = messages.required
  }
  if (!values.country) {
    errors.country = messages.required
  }
  if (!values.zipcode) {
    errors.zipcode = messages.required
  }
  if (!values.pin) {
    errors.pin = messages.required
  } else if (values.pin !== values.repeatPin) {
    errors.repeatPin = messages.pinMustBeEqual
  }
  if (!values.library) {
    errors.library = messages.required
  }
  return errors
}

export default reduxForm(
  {
    form: 'registration',
    fields: [ 'firstName', 'lastName', 'day', 'month', 'year', 'ssn', 'ssninfo', 'email', 'mobile', 'address', 'zipcode', 'city', 'country', 'gender', 'pin', 'repeatPin', 'history', 'library', 'acceptTerms' ],
    validate
  },
  mapStateToProps,
  mapDispatchToProps
)(intlRegistration)
