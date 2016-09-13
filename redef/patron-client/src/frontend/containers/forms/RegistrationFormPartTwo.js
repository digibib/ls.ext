import React, { PropTypes, createElement } from 'react'
import { reduxForm, Field } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as RegistrationActions from '../../actions/RegistrationActions'
import * as ModalActions from '../../actions/ModalActions'
import ValidationMessage from '../../components/ValidationMessage'
import fields from '../../../common/forms/registrationPartTwo'
import validator from '../../../common/validation/validator'
import asyncValidate from '../../utils/asyncValidate'

class RegistrationFormPartTwo extends React.Component {
  constructor (props) {
    super(props)
    this.handleCheckForExistingUser = this.handleCheckForExistingUser.bind(this)
    this.handleExpandedSSNInfo = this.handleExpandedSSNInfo.bind(this)
    this.handleAcceptTerms = this.handleAcceptTerms.bind(this)
    this.handleRegistration = this.handleRegistration.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.renderInput = this.renderInput.bind(this)
    this.renderField = this.renderField.bind(this)
    this.renderFieldWithContainerTagAndOptionalHeader = this.renderFieldWithContainerTagAndOptionalHeader.bind(this)
    this.renderTermsAndConditions = this.renderTermsAndConditions.bind(this)
    this.renderSelectField = this.renderSelectField.bind(this)
    this.renderLibraryOptions = this.renderLibraryOptions.bind(this)
    this.renderLibraryField = this.renderLibraryField.bind(this)
  }

  handleCheckForExistingUser () {
    this.props.registrationActions.checkForExistingUser()
  }

  handleExpandedSSNInfo () {
    this.props.registrationActions.showSSNInfo()
  }

  handleAcceptTerms () {
    this.props.registrationActions.toggleAcceptTerms()
  }

  handleRegistration () {
    this.props.registrationActions.postRegistration()
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  getValidator (field) {
    if (field.meta.touched && field.meta.error) {
      return <div style={{ color: 'red' }}><ValidationMessage message={field.meta.error} /></div>
    } else {
      return <div>&nbsp;</div>
    }
  }

  renderFieldWithContainerTagAndOptionalHeader (containerTag, containerProps, fieldName, fieldType, component, additionalHeaderTag, additionalHeaderMessage) {
    let formattedHeaderMessage
    if (additionalHeaderTag && additionalHeaderMessage) {
      formattedHeaderMessage = <FormattedMessage {...messages[ additionalHeaderMessage ]} />
    }
    return createElement(containerTag, containerProps,
      additionalHeaderTag && additionalHeaderMessage ? createElement(additionalHeaderTag, {}, formattedHeaderMessage) : null,
      this.renderField(fieldName, fieldType, component))
  }

  renderField (name, type, component) {
    return <Field name={name} type={type} id={name} component={component} />
  }

  renderLibraryOptions () {
    const branchOptions = []
    const libraries = this.props.libraries
    Object.keys(libraries).forEach(branchCode => {
      const branchName = libraries[ branchCode ]
      branchOptions.push(
        <option key={branchCode} value={branchCode}>
          {branchName}
        </option>
      )
    })
    return branchOptions
  }

  renderSelectField (name, options, headerTag) {
    const formattedHeaderMsg = <FormattedMessage {...messages[ name ]} />
    const header = createElement(headerTag, {}, formattedHeaderMsg)
    return (
      <div>
        {header}
        <div className="select-container">
          <Field name={name} component="select">
            {options.map(option => <option
              value={option}>{this.props.intl.formatMessage({ ...messages[ option ] })}</option>)}
          </Field>
        </div>
      </div>
    )
  }

  renderLibraryField (name, headerTag) {
    const formattedHeaderMsg = <FormattedMessage {...messages[ name ]} />
    const header = createElement(headerTag, {}, formattedHeaderMsg)
    return (
      <div>
        {header}
        <div className="select-container">
          <Field name={name} component="select">
            {this.renderLibraryOptions()}
          </Field>
        </div>
      </div>
    )
  }

  renderInput (field) {
    console.log('fieldname', field.name)
    return (
      <div>
        <h4><FormattedMessage {...messages[ field.name ]} /></h4>
        <input {...field.input} type={field.type} name={field.name} id={field.name} />
        <label htmlFor={field.name}><FormattedMessage {...messages[ field.name ]} /></label>
        { this.getValidator(field) }
      </div>
    )
  }

  renderTermsAndConditions (field) {
    return (
      <div className="terms_and_conditions">
        <input data-automation-id="accept_terms" onClick={this.handleAcceptTerms} id={field.name} {...field.input}
               type={field.type} />
        <label htmlFor={field.name}><span>{/* Helper for checkbox styling */}</span></label>
        <a href="/terms" title="termslink" target="_blank">
          <FormattedMessage {...messages.acceptTermsLink} />
        </a>
        {this.getValidator(field)}
      </div>
    )
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
      <form onSubmit={this.props.handleSubmit(this.handleRegistration)}>
        <fieldset>
          <legend><FormattedMessage {...messages.contactInfoLegend} /></legend>
          {this.renderFieldWithContainerTagAndOptionalHeader('span', { className: 'display-inline' }, 'email', 'email', this.renderInput)}
          {this.renderFieldWithContainerTagAndOptionalHeader('span', { className: 'display-inline' }, 'mobile', 'number', this.renderInput)}
          <address>
            {this.renderField('address', 'text', this.renderInput)}
            {this.renderFieldWithContainerTagAndOptionalHeader('span', { className: 'display-inline' }, 'zipcode', 'number', this.renderInput)}
            {this.renderFieldWithContainerTagAndOptionalHeader('span', { className: 'display-inline' }, 'city', 'text', this.renderInput)}
            {this.renderField('country', 'text', this.renderInput)}
          </address>
          {this.renderSelectField('gender', ['male', 'female'], 'h4')}

        </fieldset>

        <fieldset>
          <legend><FormattedMessage {...messages.personSettingsLegend} /></legend>
          {this.renderFieldWithContainerTagAndOptionalHeader('div', {}, 'pin', 'password', this.renderInput, 'h2', 'choosePin')}
          {this.renderField('repeatPin', 'password', this.renderInput)}
          {this.renderLibraryField('chooseBranch', 'h2')}
          {this.renderField('acceptTerms', 'checkbox', this.renderTermsAndConditions)}
          <button className="black-btn" type="submit" disabled={submitting || this.hasInvalidFormFields()}
                  data-automation-id="register_button">
            <FormattedMessage {...messages.register} />
          </button>
          <h3><a onClick={this.handleCancel} title="cancel"><FormattedMessage {...messages.cancel} /></a></h3>
        </fieldset>
      </form>
    )
  }
}

const messages = defineMessages({
  email: {
    id: 'RegistrationFormPartTwo.email',
    description: 'Label for the email field',
    defaultMessage: 'Email'
  },
  mobile: {
    id: 'RegistrationFormPartTwo.mobile',
    description: 'Label for the mobile field',
    defaultMessage: 'Mobile'
  },
  address: {
    id: 'RegistrationFormPartTwo.address',
    description: 'Label for the address field',
    defaultMessage: 'Address'
  },
  zipcode: {
    id: 'RegistrationFormPartTwo.zipcode',
    description: 'Label for the zipcode field',
    defaultMessage: 'Zipcode'
  },
  city: {
    id: 'RegistrationFormPartTwo.city',
    description: 'Label for the city field',
    defaultMessage: 'City'
  },
  country: {
    id: 'RegistrationFormPartTwo.country',
    description: 'Label for the country field',
    defaultMessage: 'Country'
  },
  gender: {
    id: 'RegistrationFormPartTwo.gender',
    description: 'Label for the gender field',
    defaultMessage: 'Gender'
  },
  male: {
    id: 'RegistrationFormPartTwo.male',
    description: 'Label for the male gender',
    defaultMessage: 'Male'
  },
  female: {
    id: 'RegistrationFormPartTwo.female',
    description: 'Label for the female gender',
    defaultMessage: 'Female'
  },
  pin: {
    id: 'RegistrationFormPartTwo.pin',
    description: 'Label for the pin field',
    defaultMessage: 'Pin'
  },
  choosePin: {
    id: 'RegistrationFormPartTwo.choosePin',
    description: 'Label for choosing pin field',
    defaultMessage: 'Velg deg en pin kode'
  },
  repeatPin: {
    id: 'RegistrationFormPartTwo.repeatPin',
    description: 'Label for repeating chosen pin field',
    defaultMessage: 'Bekreft PIN'
  },
  register: {
    id: 'RegistrationFormPartTwo.register',
    description: 'The register button text',
    defaultMessage: 'Register'
  },
  contactInfoLegend: {
    id: 'RegistrationFormPartTwo.contactInfoLegend',
    description: 'Fieldset legend for contact information',
    defaultMessage: 'Contact information'
  },
  personSettingsLegend: {
    id: 'RegistrationFormPartTwo.personSettingsLegend',
    description: 'Fieldset legend for personal settings',
    defaultMessage: 'Personal settings'
  },
  yesOption: {
    id: 'RegistrationFormPartTwo.yesOption',
    description: 'Affirmative select option',
    defaultMessage: 'Yes'
  },
  noOption: {
    id: 'RegistrationFormPartTwo.noOption',
    description: 'Negative select option',
    defaultMessage: 'No'
  },
  chooseBranch: {
    id: 'RegistrationFormPartTwo.chooseBranch',
    description: 'Choose home branch label',
    defaultMessage: 'Choose Your Home Branch'
  },
  acceptTermsLink: {
    id: 'RegistrationFormPartTwo.acceptTermsLink',
    description: 'Link text for Terms and Conditions',
    defaultMessage: 'Accept Terms and Conditions'
  },
  cancel: {
    id: 'RegistrationFormPartTwo.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  }
})

RegistrationFormPartTwo.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  registrationActions: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  libraries: PropTypes.object.isRequired,
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
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    loginError: state.application.loginError,
    libraries: state.application.libraries,
    showSSNInfo: state.registration.showSSNInfo,
    isCheckingForExistingUser: state.registration.isCheckingForExistingUser,
    checkForExistingUserSuccess: state.registration.checkForExistingUserSuccess,
    acceptTerms: state.registration.acceptTerms,
    initialValues: {
      library: Object.keys(state.application.libraries)[ 0 ] // Makes sure this field has a value even if it is not touched,
    },
    fields: state.form.registrationPartTwo ? state.form.registrationPartTwo : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    registrationActions: bindActionCreators(RegistrationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

let intlRegistrationFormPartTwo = injectIntl(RegistrationFormPartTwo)

intlRegistrationFormPartTwo = reduxForm(
  {
    form: 'registrationPartTwo',
    asyncValidate,
    asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
    validate: validator(fields)
  })(intlRegistrationFormPartTwo)

intlRegistrationFormPartTwo = connect(
  mapStateToProps,
  mapDispatchToProps
)(intlRegistrationFormPartTwo)

export { intlRegistrationFormPartTwo as RegistrationFormPartTwo }

export default intlRegistrationFormPartTwo
