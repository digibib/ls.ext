import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import fields from '../../../common/forms/userInfoForm'

import FormInputField from '../../components/FormInputField'
import * as ProfileActions from '../../actions/ProfileActions'
import asyncValidate from '../../utils/asyncValidate'
import ValidationMessage from '../../components/ValidationMessage'
import validator from '../../../common/validation/validator'

const formName = 'contactDetails'

class ContactDetailsForm extends React.Component {
  constructor (props) {
    super(props)
    this.getValidator = this.getValidator.bind(this)
  }

  hasInvalidFormFields () {
    return Object.values(this.props.fields).every(field => field.error)
  }

  getValidator (field) {
    if (field.meta.touched && field.meta.error) {
      return <div className="feedback"><ValidationMessage message={field.meta.error} /></div>
    }
  }
  render () {
    return (
      <div className="change-contact-details">
        <h2><FormattedMessage {...messages.verifyContactDetails} /></h2>
        <section>
          <div className="contact-verification-fields">
            <FormInputField name="mobile"
                            message={messages.mobile}
                            formName={formName}
                            getValidator={this.getValidator}
                            headerType=""
                            placeholder={messages.mobile} />
            <FormInputField name="email"
                            message={messages.email}
                            formName={formName}
                            getValidator={this.getValidator}
                            headerType=""
                            placeholder={messages.email}
                            type="email" />
          </div>
        </section>
      </div>
    )
  }
}

export const messages = defineMessages({
  mobile: {
    id: 'ContactDetailsForm.mobile',
    description: 'The label for the mobile',
    defaultMessage: 'Mobile'
  },
  email: {
    id: 'ContactDetailsForm.email',
    description: 'The label for the email',
    defaultMessage: 'Email'
  },
  verifyContactDetails: {
    id: 'ContactDetailsForm.verifyContactDetails',
    description: 'The label contact verification header',
    defaultMessage: 'Please verify / fill in contact details below'
  }
})

ContactDetailsForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profileActions: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    fields: state.form.contactDetailsForm ? state.form.contactDetailsForm : {},
    initialValues: state.profile.personalInformation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

const intlContactDetailsForm = injectIntl(ContactDetailsForm)
export { intlContactDetailsForm as ContactDetailsForm }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({ form: formName,
  asyncValidate,
  asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
  validate: validator(fields)
})(intlContactDetailsForm))
