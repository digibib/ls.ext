import PropTypes from 'prop-types'
import React from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { browserHistory } from 'react-router'

import * as RegistrationActions from '../../actions/RegistrationActions'
import ValidationMessage from '../../components/ValidationMessage'
import fields from '../../../common/forms/registrationPartTwo'
import validator from '../../../common/validation/validator'
import asyncValidate from '../../utils/asyncValidate'
import FormInputField from '../../components/FormInputField'
import FormInputFieldTermsAndConditions from '../../components/FormInputFieldTermsAndConditions'
import FormSelectFieldLibrary from '../../components/FormSelectFieldLibrary'

const formName = 'registrationPartTwo'

class RegistrationFormPartTwo extends React.Component {
  constructor (props) {
    super(props)
    this.handleCheckForExistingUser = this.handleCheckForExistingUser.bind(this)
    this.handleExpandedSSNInfo = this.handleExpandedSSNInfo.bind(this)
    this.handleAcceptTerms = this.handleAcceptTerms.bind(this)
    this.handleRegistration = this.handleRegistration.bind(this)
    this.handleKey = this.handleKey.bind(this)
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
    this.props.registrationActions.formFilled()
  }

  handleKey (event) {
    if (event.keyCode === 32) { // Space for button
      browserHistory.goBack
    }
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
      <form onSubmit={this.props.handleSubmit(this.handleRegistration)}>
        <div>
          <legend><FormattedMessage {...messages.contactInfoLegend} /></legend>
          <FormInputField name="email" message={messages.email} formName={formName} type="email"
                          getValidator={this.getValidator} />
          <FormInputField name="mobile" message={messages.mobile} formName={formName}
                          getValidator={this.getValidator} />
          <address>
            <FormInputField name="address" message={messages.address} formName={formName}
                            getValidator={this.getValidator} />
            <FormInputField name="zipcode" message={messages.zipcode} formName={formName}
                            getValidator={this.getValidator} />
            <FormInputField name="city" message={messages.city} formName={formName} getValidator={this.getValidator} />
          </address>
        </div>
        <div>
          <legend><FormattedMessage {...messages.choosePin} /></legend>
          <FormInputField name="pin" message={messages.pin} formName={formName} type="password"
                          getValidator={this.getValidator} />
          <FormInputField name="repeatPin" type="password" message={messages.repeatPin} formName={formName}
                          getValidator={this.getValidator} />
          <FormSelectFieldLibrary libraries={this.props.libraries} message={messages.chooseBranch} name="library"
                                  formName={formName} />
          <p>
            <a href="https://www.deichman.no/utlansreglement" target="_blank">
              <FormattedMessage {...messages.acceptTermsLink} />
            </a>
          </p>
          <FormInputFieldTermsAndConditions formName={formName}
                                            handleAcceptTerms={this.handleAcceptTerms}
                                            name="acceptTerms"
                                            message={messages.acceptTermsLabel}
                                            getValidator={this.getValidator}
                                            type="checkbox"
          />
          <p>
            <button className="blue-btn" type="submit" disabled={submitting || this.hasInvalidFormFields()}
                    data-automation-id="register_button">
              <FormattedMessage {...messages.register} />
            </button>
            <a role="button" tabIndex="0" className="cancel-link" onKeyDown={this.handleKey} onClick={browserHistory.goBack}
               title="cancel"><FormattedMessage {...messages.cancel} /></a>
          </p>
        </div>
      </form>
    )
  }
}

export const messages = defineMessages({
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
    defaultMessage: 'Choose your PIN number (4 digits)'
  },
  repeatPin: {
    id: 'RegistrationFormPartTwo.repeatPin',
    description: 'Label for repeating chosen pin field',
    defaultMessage: 'Confirm PIN'
  },
  register: {
    id: 'RegistrationFormPartTwo.register',
    description: 'The register button text',
    defaultMessage: 'Continue'
  },
  contactInfoLegend: {
    id: 'RegistrationFormPartTwo.contactInfoLegend',
    description: 'Fieldset legend for contact information',
    defaultMessage: 'Your contact details'
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
    defaultMessage: 'Choose Your Home Library'
  },
  acceptTermsLink: {
    id: 'RegistrationFormPartTwo.acceptTermsLink',
    description: 'Link text for Terms and Conditions',
    defaultMessage: 'Open terms and conditions in a new window'
  },
  acceptTermsLabel: {
    id: 'RegistrationFormPartTwo.acceptTermsLabel',
    description: 'Text used in label for accept terms and conditions checkbox',
    defaultMessage: 'I have read and accept the terms and conditions'
  },
  cancel: {
    id: 'RegistrationFormPartTwo.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  }
})

RegistrationFormPartTwo.propTypes = {
  dispatch: PropTypes.func.isRequired,
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
    registrationActions: bindActionCreators(RegistrationActions, dispatch)
  }
}

const intlRegistrationFormPartTwo = injectIntl(RegistrationFormPartTwo)
export { intlRegistrationFormPartTwo as RegistrationFormPartTwo }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({
  form: formName,
  destroyOnUnmount: false,
  asyncValidate,
  asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
  validate: validator(fields)
})(intlRegistrationFormPartTwo))
