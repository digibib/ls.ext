import React, { PropTypes } from 'react'
import { reduxForm, reset } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import FormInputField from '../../components/FormInputField'
import * as ProfileActions from '../../actions/ProfileActions'

const formName = 'changePin'

class ChangePinForm extends React.Component {
  constructor (props) {
    super(props)
    this.handleChangePin = this.handleChangePin.bind(this)
    this.getValidator = this.getValidator.bind(this)
  }

  handleChangePin () {
    this.props.profileActions.changePasswordFromForm(reset('changePin'))
  }

  hasInvalidFormFields () {
    return Object.values(this.props.fields).every(field => field.error)
  }

  renderError () {
    const { changePasswordError } = this.props
    if (changePasswordError) {
      return messages[ changePasswordError.message ]
        ? <div style={{ color: 'red', fontSize: '12px' }}>
        <FormattedMessage {...messages[ changePasswordError.message ]} /></div>
        : <div style={{ color: 'red', fontSize: '12px' }}><FormattedMessage {...messages.genericChangePasswordError} />
      </div>
    }
  }

  getValidator (field) {
    if (field && field.meta.touched && field.meta.error) {
      return <div style={{ color: 'red', fontSize: '12px' }}>{this.props.intl.formatMessage(field.meta.error)}</div>
    }
  }

  render () {
    const {
      submitting,
      handleSubmit,
      changePasswordSuccess
    } = this.props
    return (
      <div className="change-pin-container">
        <form onSubmit={handleSubmit(this.handleChangePin)}>

          <header>
            <h1><FormattedMessage {...messages.changePin} /></h1>
          </header>

          <section className="change-pin">
            <div className="important">
              <p><FormattedMessage {...messages.pinInfo} /></p>
            </div>

            <div className="change-pin-fields">
              <FormInputField name="currentPin" type="password" message={messages.currentPin} headerType="h2"
                              getValidator={this.getValidator} isLabelOverInput="" hasLabel="hasLabel"
                              formName={formName} />
              {this.renderError()}
              <FormInputField name="newPin" type="password" message={messages.newPin} headerType="h2"
                              getValidator={this.getValidator} isLabelOverInput="" hasLabel="hasLabel"
                              formName={formName} />
              <FormInputField name="repeatPin" type="password" message={messages.repeatPin} headerType="h2"
                              getValidator={this.getValidator} isLabelOverInput="" hasLabel="hasLabel"
                              formName={formName} />
            </div>
          </section>
          <footer>
            <button className="black-btn" type="submit" disabled={submitting}>
              <FormattedMessage {...messages.changePin} /><br /></button>
            {changePasswordSuccess
              ? <div style={{ color: 'green' }}><FormattedMessage {...messages.changePinSuccess} /></div> : null}
          </footer>
        </form>
      </div>
    )
  }
}

const messages = defineMessages({
  changePin: {
    id: 'ChangePinForm.changePin',
    description: 'The change PIN code header and button text',
    defaultMessage: 'Change PIN code'
  },
  pinInfo: {
    id: 'ChangePinForm.pinInfo',
    description: 'Important information about PIN codes',
    defaultMessage: 'Important information, read this: New passwords must be provided in the form of a 4 digit PIN code. Do not use PIN codes that you have used other places. Choose a PIN code that noone can guess. Avoid PINs such as 1111 and 1234.'
  },
  currentPin: {
    id: 'ChangePinForm.currentPin',
    description: 'The label for the current PIN input',
    defaultMessage: 'Current PIN code'
  },
  newPin: {
    id: 'ChangePinForm.newPin',
    description: 'The label for the new PIN input',
    defaultMessage: 'New PIN code'
  },
  repeatPin: {
    id: 'ChangePinForm.repeatPin',
    description: 'The label for the input where the new PIN is repeated',
    defaultMessage: 'Repeat PIN code'
  },
  currentPinRequired: {
    id: 'ChangePinForm.currentPinRequired',
    description: 'The error message when current PIN is not provided',
    defaultMessage: 'Current PIN must be provided'
  },
  newPinRequired: {
    id: 'ChangePinForm.newPinRequired',
    description: 'The error message when a new PIN is not provided',
    defaultMessage: 'A new PIN must be provided'
  },
  pinsMustBeEqual: {
    id: 'ChangePinForm.pinsMustBeEqual',
    description: 'The error message when the two PIN fields do not match',
    defaultMessage: 'Must be equal'
  },
  currentPinNotCorrect: {
    id: 'ChangePinForm.currentPinNotCorrect',
    description: 'Error when the current PIN is not correct',
    defaultMessage: 'The current PIN code is not correct'
  },
  genericChangePasswordError: {
    id: 'ChangePinForm.genericChangePasswordError',
    description: 'Generic error message when change of PIN fails',
    defaultMessage: 'Something went wrong when changing the PIN'
  },
  changePinSuccess: {
    id: 'ChangePinForm.changePinSuccess',
    description: 'Message shown when PIN successfully changed',
    defaultMessage: 'PIN was changed!'
  }
})

ChangePinForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profileActions: PropTypes.object.isRequired,
  changePasswordSuccess: PropTypes.bool.isRequired,
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  changePasswordError: PropTypes.object
}

function mapStateToProps (state) {
  return {
    changePasswordError: state.profile.changePasswordError,
    changePasswordSuccess: state.profile.changePasswordSuccess,
    initialValues: {},
    fields: state.form.changePin ? state.form.changePin : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

const validate = (values, props) => {
  const errors = {}
  if (!values.currentPin) {
    errors.currentPin = messages.currentPinRequired
  }
  if (props.changePasswordError) {

  }
  if (!values.newPin) {
    errors.newPin = messages.newPinRequired
  }
  if (values.newPin !== values.repeatPin) {
    errors.repeatPin = messages.pinsMustBeEqual
  }
  return errors
}

const intlChangePinForm = injectIntl(ChangePinForm)
export { intlChangePinForm as ChangePinForm }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({ form: formName, validate })(intlChangePinForm))
