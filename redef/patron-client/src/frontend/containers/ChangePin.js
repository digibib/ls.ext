import React, { PropTypes } from 'react'
import { reduxForm, reset } from 'redux-form'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as ProfileActions from '../actions/ProfileActions'

class ChangePin extends React.Component {
  constructor (props) {
    super(props)
    this.handleChangePin = this.handleChangePin.bind(this)
  }

  handleChangePin () {
    this.props.profileActions.changePassword(
      this.currentPinField.value,
      this.pinField.value,
      reset('changePin')
    )
  }

  getValidator (field) {
    if (field && field.touched && field.error) {
      return <div style={{color: 'red'}}>{this.props.intl.formatMessage(field.error)}</div>
    }
  }

  hasInvalidFormFields () {
    return Object.values(this.props.fields).every(field => field.error)
  }

  renderError () {
    const { changePasswordError } = this.props
    if (changePasswordError) {
      return messages[ changePasswordError.message ]
        ? <div style={{color: 'red'}}><FormattedMessage {...messages[ changePasswordError.message ]} /></div>
        : <div style={{color: 'red'}}><FormattedMessage {...messages.genericChangePasswordError} /></div>
    }
  }

  render () {
    const {
      fields: {
        currentPin, newPin, repeatPin
      },
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
              <h2><FormattedMessage {...messages.currentPin} /></h2>
              <input type="text" name="current-pin" id="current-pin"
                     ref={e => this.currentPinField = e} {...currentPin} />
              <label htmlFor="current-pin"> <FormattedMessage {...messages.currentPin} /></label>
              {this.renderError()}
              {this.getValidator(currentPin)}
              <h2><FormattedMessage {...messages.newPin} /></h2>
              <input type="text" name="new-pin" id="new-pin" ref={e => this.pinField = e} {...newPin} />
              <label htmlFor="new-pin"><FormattedMessage {...messages.repeatPin} /></label>
              {this.getValidator(newPin)}
              <h2><FormattedMessage {...messages.repeatPin} /></h2>
              <input type="text" name="repeat-pin" id="repeat-pin" ref={e => this.repeatPinField = e} {...repeatPin} />
              <label htmlFor="repeat-pin"><FormattedMessage {...messages.repeatPin} /></label>
              {this.getValidator(repeatPin)}
            </div>
          </section>
          <footer>
            <button className="black-btn" type="submit" disabled={submitting}>
              <FormattedMessage {...messages.changePin} /><br /></button>
            {changePasswordSuccess
              ? <div style={{color: 'green'}}><FormattedMessage {...messages.changePinSuccess} /></div> : null}
          </footer>
        </form>
      </div>
    )
  }
}

const messages = defineMessages({
  changePin: {
    id: 'ChangePin.changePin',
    description: 'The change PIN code header and button text',
    defaultMessage: 'Change PIN code'
  },
  pinInfo: {
    id: 'ChangePin.pinInfo',
    description: 'Important information about PIN codes',
    defaultMessage: 'Important information, read this: New passwords must be provided in the form of a 4 digit PIN code. Do not use PIN codes that you have used other places. Choose a PIN code that noone can guess. Avoid PINs such as 1111 and 1234.'
  },
  currentPin: {
    id: 'ChangePin.currentPin',
    description: 'The label for the current PIN input',
    defaultMessage: 'Current PIN code'
  },
  newPin: {
    id: 'ChangePin.newPin',
    description: 'The label for the new PIN input',
    defaultMessage: 'New PIN code'
  },
  repeatPin: {
    id: 'ChangePin.repeatPin',
    description: 'The label for the input where the new PIN is repeated',
    defaultMessage: 'Repeat PIN code'
  },
  currentPinRequired: {
    id: 'ChangePin.currentPinRequired',
    description: 'The error message when current PIN is not provided',
    defaultMessage: 'Current PIN must be provided'
  },
  newPinRequired: {
    id: 'ChangePin.newPinRequired',
    description: 'The error message when a new PIN is not provided',
    defaultMessage: 'A new PIN must be provided'
  },
  pinsMustBeEqual: {
    id: 'ChangePin.pinsMustBeEqual',
    description: 'The error message when the two PIN fields do not match',
    defaultMessage: 'Must be equal'
  },
  currentPinNotCorrect: {
    id: 'ChangePin.currentPinNotCorrect',
    description: 'Error when the current PIN is not correct',
    defaultMessage: 'The current PIN code is not correct'
  },
  genericChangePasswordError: {
    id: 'ChangePin.genericChangePasswordError',
    description: 'Generic error message when change of PIN fails',
    defaultMessage: 'Something went wrong when changing the PIN'
  },
  changePinSuccess: {
    id: 'ChangePin.changePinSuccess',
    description: 'Message shown when PIN successfully changed',
    defaultMessage: 'PIN was changed!'
  }
})

ChangePin.propTypes = {
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
    initialValues: {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

const intlChangePin = injectIntl(ChangePin)
export { intlChangePin as ChangePin }

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

export default reduxForm(
  {
    form: 'changePin',
    fields: [ 'currentPin', 'repeatPin', 'newPin' ],
    validate
  },
  mapStateToProps,
  mapDispatchToProps
)(intlChangePin)
