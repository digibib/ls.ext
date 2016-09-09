import React, { PropTypes } from 'react'
import { reduxForm, Field } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as RegistrationActions from '../../actions/RegistrationActions'
import * as ModalActions from '../../actions/ModalActions'
import Libraries from '../../components/Libraries'
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

  renderInput (field) {
    return (
      <div>
        <input {...field.input} type={field.type} />
        { this.getValidator(field) }
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
          <span className="display-inline">
          <h4><FormattedMessage {...messages.email} /></h4>
            <Field
              name="email"
              type="text"
              id="email"
              component={this.renderInput}
            />
          <label htmlFor="email"><FormattedMessage {...messages.email} /></label>
        </span>
          <span className="display-inline">
          <h4><FormattedMessage {...messages.mobile} /></h4>
            <Field
              name="mobile"
              type="text"
              id="mobile"
              component={this.renderInput}
            />
          <label htmlFor="mobile"><FormattedMessage {...messages.mobile} /></label>
        </span>
          <address>
            <h4><FormattedMessage {...messages.address} /></h4>
            <Field
              name="address"
              type="text"
              id="address"
              component={this.renderInput}
            />
            <label htmlFor="address"><FormattedMessage {...messages.address} /></label>
            <span className="display-inline">
            <h4><FormattedMessage {...messages.zipcode} /></h4>
              <Field
                name="zipcode"
                type="text"
                id="zipcode"
                component={this.renderInput}
              />
            <label htmlFor="zipcode"><FormattedMessage {...messages.zipcode} /></label>
          </span>
            <span className="display-inline">
            <h4><FormattedMessage {...messages.city} /></h4>
              <Field
                name="city"
                type="text"
                id="city"
                component={this.renderInput}
              />
            <label htmlFor="city"><FormattedMessage {...messages.city} /></label>
          </span>
            <h4><FormattedMessage {...messages.country} /></h4>
            <label htmlFor="country"><FormattedMessage {...messages.country} /></label>
            <Field
              name="country"
              type="text"
              id="country"
              component={this.renderInput}
            />
          </address>

          <h4><FormattedMessage {...messages.gender} /></h4>
          <div className="select-container">
            <select data-automation-id="gender_selection" name="gender" >
              <option value="male">{this.props.intl.formatMessage({ ...messages.male })}</option>
              <option value="female">{this.props.intl.formatMessage({ ...messages.female })}</option>
            </select>
          </div>

        </fieldset>

        <fieldset>
          <legend><FormattedMessage {...messages.personSettingsLegend} /></legend>
          <h2><FormattedMessage {...messages.choosePin} /></h2>
          <Field
            data-automation-id="choose_pin"
            name="pin"
            type="password"
            id="pin"
            component={this.renderInput}
          />
          <label htmlFor="pin"><FormattedMessage {...messages.choosePin} /></label>
          <Field
            data-automation-id="repeat_pin"
            name="repeatPin"
            type="password"
            id="repeatPin"
            component={this.renderInput}
          />
          <label htmlFor="repeatPin"><FormattedMessage {...messages.repeatPin} /></label>
          <h2><FormattedMessage {...messages.chooseBranch} /></h2>
          <div className="select-container">
            <Libraries libraries={this.props.libraries} />
          </div>
          <div className="terms_and_conditions">
            <Field
              name="acceptTerms"
              data-automation-id="accept_terms"
              onClick={this.handleAcceptTerms}
              id="acceptTerms"
              type="checkbox"
              component={this.renderInput}
            />
            <label htmlFor="acceptTerms"><span>{/* Helper for checkbox styling */}</span></label>
            <a href="/terms" title="termslink" target="_blank">
              <FormattedMessage {...messages.acceptTermsLink} />
            </a>
          </div>
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
