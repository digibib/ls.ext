import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { reduxForm } from 'redux-form'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import { connect } from 'react-redux'

import * as ParameterActions from '../../actions/ParameterActions'
import * as ProfileActions from '../../actions/ProfileActions'
import * as LoginActions from '../../actions/LoginActions'
import validator from '../../../common/validation/validator'
import fields from '../../../common/forms/userInfoForm'
import ValidationMessage from '../../components/ValidationMessage'
import asyncValidate from '../../utils/asyncValidate'
import FormInputFieldWithTopLabelContainer from '../../components/FormInputFieldWithTopLabelContainer'

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
      return <div style={{ color: 'red' }}><ValidationMessage message={field.meta.error} /></div>
    }
  }

  render () {
    return (
      <form name="change-user-details" id="change-user-details">
        <div className="address col">
          <address typeof="schema:PostalAddress">
            <FormInputFieldWithTopLabelContainer fieldName="address" fieldType="text" fieldHeaderType="h2"
                                                 fieldMessage={messages.address} containerTag="span"
                                                 getFieldValidator={this.getValidator} formName={formName}
                                                 containerProps={{ property: 'schema:streetAddress' }}
                                                 placeholder={messages.address} />
            <br />
            <FormInputFieldWithTopLabelContainer fieldName="zipcode" fieldType="text" fieldHeaderType="h2"
                                                 fieldMessage={messages.zipcode} containerTag="span"
                                                 getFieldValidator={this.getValidator} containerProps={{
                                                   property: 'schema:postalCode',
                                                   className: 'display-inline'
                                                 }} formName={formName} placeholder={messages.zipcode} />

            <FormInputFieldWithTopLabelContainer fieldName="city" fieldType="text" fieldHeaderType="h2"
                                                 fieldMessage={messages.city} containerTag="span"
                                                 getFieldValidator={this.getValidator} containerProps={{
                                                   property: 'schema:addressLocality',
                                                   className: 'display-inline'
                                                 }} formName={formName} placeholder={messages.city} />

            <br />
            <FormInputFieldWithTopLabelContainer fieldName="country" fieldType="text" fieldHeaderType="h2"
                                                 fieldMessage={messages.country} containerTag="span"
                                                 getFieldValidator={this.getValidator} formName={formName}
                                                 containerProps={{ property: 'schema:addressCountry' }}
                                                 placeholder={messages.country} />
            <br />
          </address>
        </div>

        <div className="col">
          <FormInputFieldWithTopLabelContainer fieldName="mobile" fieldType="number" fieldHeaderType="h2"
                                               fieldMessage={messages.mobile} containerTag="div" formName={formName}
                                               getFieldValidator={this.getValidator}
                                               containerProps={{ className: 'cell-phone' }}
                                               placeholder={messages.mobile} />

          <FormInputFieldWithTopLabelContainer fieldName="telephone" fieldType="number" fieldHeaderType="h2"
                                               fieldMessage={messages.telephone} containerTag="div" formName={formName}
                                               getFieldValidator={this.getValidator} placeholder={messages.telephone}
                                               containerProps={{ className: 'phone' }} />

          <FormInputFieldWithTopLabelContainer fieldName="email" fieldType="email" fieldHeaderType="h2"
                                               fieldMessage={messages.email} containerTag="div" formName={formName}
                                               getFieldValidator={this.getValidator} placeholder={messages.email}
                                               containerProps={{ className: 'email' }} />
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
  mapDispatchToProps,
  mapStateToProps
)(reduxForm({
  form: formName,
  asyncValidate,
  asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
  validate: validator(fields)
})(intlUserInfoForm))
