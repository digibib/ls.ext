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
    this.handleRegistration = this.handleRegistration.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleRegistration () {
    this.props.registrationActions.postRegistration()
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSuccess () {
    return (
      <div data-automation-id='registration_success_modal' className='default-modal'>
        <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
        <p>
          <FormattedMessage {...messages.messageSuccess} /><br />
          <span data-automation-id='username'>{this.props.username}</span>
        </p>
        <button className='black-btn' onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id='registration_error_modal' className='default-modal'>
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericRegistrationError} />}
        </p>
        <button className='black-btn' onClick={this.props.modalActions.hideModal}>
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

  render () {
    const {
      fields: {
        firstName, lastName, day, month, year, email, mobile, address, zipcode, city, country, pin, repeatPin, library
      },
      submitting
    } = this.props
    if (this.props.isError) {
      return this.renderError()
    } else if (this.props.isSuccess) {
      return this.renderSuccess()
    }
    return (
      <div>
        <section className='register-modal'>
          <div data-automation-id='registration_modal'>
            <form onSubmit={this.props.handleSubmit(this.handleRegistration)}>
              <h1><FormattedMessage {...messages.registerAsLoaner} /></h1>
        <span className='display-inline'>
          <h2><FormattedMessage {...messages.firstName} /></h2>
          <input name='name' type='text' id='name' {...firstName} />
          <label htmlFor='name'><FormattedMessage {...messages.firstName} /></label>
          {this.getValidator(firstName)}
        </span>
        <span className='display-inline'>
          <h2><FormattedMessage {...messages.lastName} /></h2>
          <input name='lastname' type='text' id='lastname' {...lastName} />
          <label htmlFor='lastname'><FormattedMessage {...messages.lastName} /></label>
          {this.getValidator(lastName)}
        </span>
              <div className='date-of-birth'>
                <div className='item'>
                  <h2><FormattedMessage {...messages.day} /></h2>
                  <input name='day' type='number' id='day' {...day} />
                  <label htmlFor='day'><FormattedMessage {...messages.day} /></label>
                  {this.getValidator(day)}
                </div>
                <div className='item'>
                  <h2><FormattedMessage {...messages.month} /></h2>
                  <input name='month' type='number' id='month' {...month} />
                  <label htmlFor='month'><FormattedMessage {...messages.month} /></label>
                  {this.getValidator(month)}
                </div>
                <div className='item'>
                  <h2><FormattedMessage {...messages.year} /></h2>
                  <input name='year' type='number' id='year' {...year} />
                  <label htmlFor='year'><FormattedMessage {...messages.year} /></label>
                  {this.getValidator(year)}
                </div>
              </div>
        <span className='display-inline'>
          <h2><FormattedMessage {...messages.email} /></h2>
          <input name='email' type='text' id='email' {...email} />
          <label htmlFor='email'><FormattedMessage {...messages.email} /></label>
          {this.getValidator(email)}
        </span>
        <span className='display-inline'>
          <h2><FormattedMessage {...messages.mobile} /></h2>
          <input name='mobile' type='text' id='mobile' {...mobile} />
          <label htmlFor='mobile'><FormattedMessage {...messages.mobile} /></label>
          {this.getValidator(mobile)}
        </span>
              <address>
                <h2><FormattedMessage {...messages.address} /></h2>
                <input name='address' type='text' id='address' {...address} />
                <label htmlFor='address'><FormattedMessage {...messages.address} /></label>
                {this.getValidator(address)}
          <span className='display-inline'>
            <h2><FormattedMessage {...messages.zipcode} /></h2>
            <input name='zipcode' type='text' id='zipcode' {...zipcode} />
            <label htmlFor='zipcode'><FormattedMessage {...messages.zipcode} /></label>
            {this.getValidator(zipcode)}
          </span>
          <span className='display-inline'>
            <h2><FormattedMessage {...messages.city} /></h2>
            <input name='city' type='text' {...city} />
            <label htmlFor='city'><FormattedMessage {...messages.city} /></label>
            {this.getValidator(city)}
          </span>
                <h2><FormattedMessage {...messages.country} /></h2>
                <label htmlFor='country'><FormattedMessage {...messages.country} /></label>
                <input name='country' type='text' id='country' {...country} />
                {this.getValidator(country)}
              </address>
              {/* <h2><FormattedMessage {...messages.gender} /></h2>
               <div className='select-container'>
               <select>
               <option>Mann</option>
               <option>Kvinne</option>
               </select>
               </div> */}
              <h2>Velg deg en pin kode</h2>
              <input name='code' type='password' id='code' {...pin} />
              <label htmlFor='code'>Velg deg en kode</label>
              <input name='code' type='password' id='code' {...repeatPin} />
              <label htmlFor='code'>Bekreft PIN</label>
              {this.getValidator(pin)}
              {this.getValidator(repeatPin)}
              <h2>Velg "Din filial"</h2>
              <div className='select-container'>
                <Libraries libraries={this.props.libraries} selectProps={library} />
              </div>
              <div className='patron-placeholder'>
                <h2>Husk lån etter levering? (Historikk)</h2>
                <input name='yes' type='radio' id='yes' />
                <p className='display-inline'>Ja</p>
                <label htmlFor='yes'>Ja</label>
                <input name='no' type='radio' id='no' />
                <p className='display-inline'>Nei</p>
                <label htmlFor='code'>Nei</label>
              </div>
              <button className='black-btn' type='submit' disabled={submitting || this.hasInvalidFormFields()}
                      data-automation-id='register_button'>
                <FormattedMessage {...messages.register} />
              </button>
              <h3><a onClick={this.handleCancel} title='register'>Avbryt</a></h3>
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
    defaultMessage: 'The user is now registered.'
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
  pin: {
    id: 'Registration.pin',
    description: 'Label for the pin field',
    defaultMessage: 'Pin'
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
  pinMustBeEqual: {
    id: 'Registration.pinsMustBeEqual',
    description: 'Displayed when the pin and repeat pin is not equal',
    defaultMessage: 'PINs must be equal'
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
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    loginError: state.application.loginError,
    libraries: state.application.libraries,
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
  }
  if (!values.month) {
    errors.month = messages.required
  }
  if (!values.day) {
    errors.day = messages.required
  }
  if (!values.email) {
    errors.email = messages.required
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = messages.invalidEmail
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
    fields: [ 'firstName', 'lastName', 'day', 'month', 'year', 'email', 'mobile', 'address', 'zipcode', 'city', 'country', 'gender', 'pin', 'repeatPin', 'history', 'library', 'readTerms' ],
    validate
  },
  mapStateToProps,
  mapDispatchToProps
)(intlRegistration)
