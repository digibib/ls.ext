/**
 * Created by Nikolai on 12/09/16.
 */
import React, { PropTypes } from 'react'
import { reduxForm, Field } from 'redux-form'
import { connect } from 'react-redux'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { bindActionCreators } from 'redux'
import * as RegistrationActions from '../../actions/RegistrationActions'
import * as LoginActions from '../../actions/LoginActions'

import * as ModalActions from '../../actions/ModalActions'

class LoginForm extends React.Component {
  constructor (props) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleRegistrationClick = this.handleRegistrationClick.bind(this)
    this.renderField = this.renderField.bind(this)
    this.renderInput = this.renderInput.bind(this)
  }

  handleLogin (event) {
    event.preventDefault()
    this.props.loginActions.login(
      this.props.fields.values.username,
      this.props.fields.values.password,
      this.props.successAction ? [ ModalActions.hideModal(), this.props.successAction ] : [ ModalActions.hideModal() ]
    )
  }

  handleRegistrationClick (event) {
    event.preventDefault()
    this.props.registrationActions.startRegistration()
  }

  renderInput (field) {
    return (
      <div>
        <h2><FormattedMessage {...this.props.messages[field.name]} /></h2>
        <input {...field.input} type={field.type} />
      </div>
    )
  }

  renderField (name, type) {
    return <Field name={name} type={type} id={name} component={this.renderInput} />
  }

  render () {
    return (
      <div data-automation-id="login_modal">
        <form onSubmit={this.handleLogin}>
          <h1>Logg inn for å reservere</h1>
          {this.renderField('username', 'text')}
          {this.renderField('password', 'password')}
          <p>Glemt PIN-kode?</p>
          <button className="black-btn" type="submit" disabled={this.props.isRequestingLogin}
                  onClick={this.handleLogin}
                  data-automation-id="login_button">
            <FormattedMessage {...this.props.messages.logIn} />
          </button>
          <h3>Er du ikke registrert? <a data-automation-id="registration_link" onClick={this.handleRegistrationClick}
                                        title="register">Registrer deg</a></h3>
        </form>
      </div>
    )
  }
}

LoginForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  isRequestingLogin: PropTypes.bool.isRequired,
  messages: PropTypes.object.isRequired,
  successAction: PropTypes.object,
  registrationActions: PropTypes.object.isRequired,
  loginActions: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    isRequestingLogin: state.application.isRequestingLogin,
    fields: state.form.loginForm ? state.form.loginForm : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    registrationActions: bindActionCreators(RegistrationActions, dispatch),
    loginActions: bindActionCreators(LoginActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

export const intlLoginForm = injectIntl(LoginForm)

export const reduxIntlLoginForm = reduxForm({
  form: 'loginForm'
})(intlLoginForm)

export const connectedIntlLoginForm = connect(mapStateToProps, mapDispatchToProps)(reduxIntlLoginForm)

export default connectedIntlLoginForm
