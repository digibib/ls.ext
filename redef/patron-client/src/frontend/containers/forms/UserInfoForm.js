import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { reduxForm } from 'redux-form'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import { connect } from 'react-redux'

import * as ParameterActions from '../../actions/ParameterActions'
import * as ProfileActions from '../../actions/ProfileActions'
import * as LoginActions from '../../actions/LoginActions'
import fields from '../../../common/forms/userInfoForm'
import ValidationMessage from '../../components/ValidationMessage'
import asyncValidate from '../../utils/asyncValidate'
import FormInputField from '../../components/FormInputField'
import validate from '../../../common/validation/validator'

const formName = 'userInfo'

class UserInfoForm extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChangeClick = this.handleChangeClick.bind(this)
  }

  handleSubmit () {
    this.props.loginActions.requireLoginBeforeAction(
      ProfileActions.postProfileInfo(ParameterActions.toggleParameter('edit'))
    )
  }

  handleChangeClick (event) {
    event.preventDefault()
    this.props.loginActions.requireLoginBeforeAction(ParameterActions.toggleParameter('edit'))
  }

  getValidator (field) {
    if (field.meta.touched && field.meta.error) {
      return <div style={{ color: 'red', fontSize: '12px' }}><ValidationMessage message={field.meta.error} /></div>
    }
  }

  render () {
    return (
      <form name="change-user-details" id="change-user-details">
        <div className="address col">
          <address typeof="schema:PostalAddress">
            <FormInputField name="address" message={messages.address} formName={formName}
                            getValidator={this.getValidator} headerType="h2" excludeLabel
                            placeholder={messages.address} />
            <br />
            <FormInputField name="zipcode" message={messages.zipcode} formName={formName}
                            getValidator={this.getValidator} headerType="h2" excludeLabel
                            placeholder={messages.zipcode} />

            <FormInputField name="city" message={messages.city} formName={formName}
                            getValidator={this.getValidator} headerType="h2" excludeLabel
                            placeholder={messages.city} />

            <br />
          </address>
        </div>

        <div className="col">
          <FormInputField name="email" message={messages.email} formName={formName}
                          getValidator={this.getValidator} headerType="h2" excludeLabel
                          placeholder={messages.email} type="email" />

          <FormInputField name="mobile" message={messages.mobile} formName={formName}
                          getValidator={this.getValidator} headerType="h2" excludeLabel
                          placeholder={messages.mobile} />

          <FormInputField name="telephone" message={messages.telephone} formName={formName}
                          getValidator={this.getValidator} headerType="h2" excludeLabel
                          placeholder={messages.telephone} />
        </div>
      </form>
    )
  }
}

UserInfoForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profileActions: PropTypes.object.isRequired,
  personalInformation: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  parameterActions: PropTypes.object.isRequired,
  isRequestingPersonalInformation: PropTypes.bool.isRequired,
  loginActions: PropTypes.object.isRequired,
  personalInformationError: PropTypes.object,
  intl: intlShape.isRequired
}

const messages = defineMessages({
  address: {
    id: 'UserInfoForm.address',
    description: 'The label for the address',
    defaultMessage: 'Address'
  },
  zipcode: {
    id: 'UserInfoForm.zipcode',
    description: 'The label for the zip code',
    defaultMessage: 'Zip code'
  },
  city: {
    id: 'UserInfoForm.city',
    description: 'The label for the city',
    defaultMessage: 'City'
  },
  country: {
    id: 'UserInfoForm.country',
    description: 'The label for the country',
    defaultMessage: 'Country'
  },
  mobile: {
    id: 'UserInfoForm.mobile',
    description: 'The label for the mobile',
    defaultMessage: 'Mobile'
  },
  telephone: {
    id: 'UserInfoForm.telephone',
    description: 'The label for the telephone',
    defaultMessage: 'Telephone'
  },
  email: {
    id: 'UserInfoForm.email',
    description: 'The label for the email',
    defaultMessage: 'Email'
  },
  required: {
    id: 'UserInfoForm.required',
    description: 'Displayed below a field when not filled out',
    defaultMessage: 'Required'
  },
  invalidEmail: {
    id: 'UserInfoForm.invalidEmail',
    description: 'Displayed when the email is not valid',
    defaultMessage: 'Invalid email address'
  }
})

function mapStateToProps (state) {
  return {
    personalInformationError: state.profile.personalInformationError,
    isRequestingPersonalInformation: state.profile.isRequestingPersonalInformation,
    personalInformation: state.profile.personalInformation,
    initialValues: state.profile.personalInformation,
    fields: state.form.userInfoForm ? state.form.userInfoForm : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch),
    parameterActions: bindActionCreators(ParameterActions, dispatch),
    loginActions: bindActionCreators(LoginActions, dispatch)
  }
}

const intlUserInfoForm = injectIntl(UserInfoForm)
export { intlUserInfoForm as UserInfoForm }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({
  form: formName,
  validate: validate(fields),
  asyncValidate,
  asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation)
})(intlUserInfoForm))
