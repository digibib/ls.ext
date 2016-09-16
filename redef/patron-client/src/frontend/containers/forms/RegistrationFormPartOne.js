import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as RegistrationActions from '../../actions/RegistrationActions'
import * as ModalActions from '../../actions/ModalActions'
import ValidationMessage from '../../components/ValidationMessage'
import fields from '../../../common/forms/registrationPartOne'
import validator from '../../../common/validation/validator'
import asyncValidate from '../../utils/asyncValidate'
import FormInputFieldWithBottomLabelContainer from '../../components/FormInputFieldWithBottomLabelContainer'
import formRequirements from '../../../common/forms/registrationPartOne'

const formName = 'registrationPartOne'

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

  renderCheckForExistingUserError (message) {
    return (
      <div data-automation-id="check_for_existing_user_error">
        <span className="display-inline">
          <p data-automation-id="check_for_existing_user_error_message">
            {messages[ message ]
              ? <FormattedMessage {...messages[ message ]} />
              : <FormattedMessage {...messages.genericRegistrationError} />}
          </p>
        </span>
      </div>
    )
  }

  renderContinueAndCancelButtons (submitting) {
    return (
      <div>
        <button className="black-btn" type="submit" disabled={submitting || this.hasInvalidFormFields()}
                data-automation-id="check_existing_user_button">
          <FormattedMessage {...messages.checkForExistingUser} />
        </button>

        <h3><a onClick={this.handleCancel} title="cancel"><FormattedMessage {...messages.cancel} /></a></h3>
      </div>
    )
  }

  getValidator (field) {
    console.log('getValidator', field.meta.touched, field.meta.error)
    if (field.meta.touched && field.meta.error) {
      return <div style={{ color: 'red', fontSize: '12px' }}><ValidationMessage message={field.meta.error} /></div>
    } else {
      return <div>&nbsp;</div>
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
        <fieldset disabled={this.props.checkForExistingUserSuccess}>
          <FormInputFieldWithBottomLabelContainer fieldName="firstName" fieldType="text" fieldHeaderType="h4"
                                                  fieldMessage={messages.firstName} containerTag="span"
                                                  containerProps={{ className: 'display-inline' }} formName={formName}
                                                  getFieldValidator={this.getValidator} headerTag="h1"
                                                  headerMessage={messages.registerAsLoaner} />

          <FormInputFieldWithBottomLabelContainer fieldName="lastName" fieldType="text" fieldHeaderType="h4"
                                                  fieldMessage={messages.lastName} containerTag="span"
                                                  containerProps={{ className: 'display-inline' }} formName={formName}
                                                  getFieldValidator={this.getValidator} />
        </fieldset>
        <fieldset disabled={this.props.checkForExistingUserSuccess}>
          <legend><FormattedMessage {...messages.personInfoLegend} /></legend>
          <div className="date-of-birth">
            <FormInputFieldWithBottomLabelContainer fieldName="day" fieldType="text" fieldHeaderType="h4"
                                                    fieldMessage={messages.day} containerTag="div"
                                                    containerProps={{ className: 'item' }} formName={formName}
                                                    getFieldValidator={this.getValidator} headerTag="h2"
                                                    headerMessage={messages.birthdate} />

            <FormInputFieldWithBottomLabelContainer fieldName="month" fieldType="text" fieldHeaderType="h4"
                                                    fieldMessage={messages.month} containerTag="div"
                                                    containerProps={{ className: 'item' }} formName={formName}
                                                    getFieldValidator={this.getValidator} />

            <FormInputFieldWithBottomLabelContainer fieldName="year" fieldType="text" fieldHeaderType="h4"
                                                    fieldMessage={messages.year} containerTag="div"
                                                    containerProps={{ className: 'item' }} formName={formName}
                                                    getFieldValidator={this.getValidator} />
          </div>
          <div className="ssn-info">
            <h3><a onClick={this.props.registrationActions.showSSNInfo}
                   title="ssnLink"><FormattedMessage {...messages.ssnLink} /></a>
            </h3>
            {this.props.showSSNInfo ? this.renderSSNInfo() : ''}
          </div>
          <FormInputFieldWithBottomLabelContainer fieldName="ssn" fieldType="text" fieldHeaderType="h4"
                                                  fieldMessage={messages.ssn} containerTag="span"
                                                  containerProps={{ className: 'display-inline' }} formName={formName}
                                                  getFieldValidator={this.getValidator} headerTag="h2"
                                                  headerMessage={messages.ssnHeader} />

          {this.props.isCheckingForExistingUser ? this.renderCheckingForExistingUser() : ''}
          {/* TODO: also handle all fields empty */}
          {this.props.checkForExistingUserSuccess ? null : this.renderContinueAndCancelButtons(submitting)}
        </fieldset>
        {this.props.checkForExistingUserSuccess ? this.renderCheckForExistingUserSuccess() : ''}
        {this.props.checkForExistingUserFailure ? this.renderCheckForExistingUserError(this.props.registrationError) : ''}
      </form>
    )
  }
}

const messages = defineMessages({
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
    defaultMessage: 'Personnr./D-nr./DUF-nr'
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
    registrationActions: bindActionCreators(RegistrationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
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
  validate: validator(formRequirements, fields)
})(intlRegistrationFormPartOne))
