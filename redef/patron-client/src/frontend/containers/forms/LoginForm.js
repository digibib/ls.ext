/**
 * Created by Nikolai on 12/09/16.
 */
import PropTypes from 'prop-types'

import React from 'react'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { bindActionCreators } from 'redux'
import { Link } from 'react-router'
import Recaptcha from 'react-recaptcha'

import FormInputField from '../../components/FormInputField'
import * as RegistrationActions from '../../actions/RegistrationActions'
import * as LoginActions from '../../actions/LoginActions'
import * as ModalActions from '../../actions/ModalActions'

const formName = 'loginForm'
let recaptchaInstance

class LoginForm extends React.Component {
  constructor (props) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
  }

  handleLogin (event) {
    event.preventDefault()
    this.props.loginActions.login(
      this.props.fields.values.username,
      this.props.fields.values.password,
      this.props.captchaResponse,
      this.props.successAction ? [ ModalActions.hideModal(), this.props.successAction ] : [ ModalActions.hideModal() ]
    )
  }

  closeModal () {
    ModalActions.hideModal()
  }

  renderError () {
    if (this.props.loginError) {
      return (
        <div className="error-msg">
          <p data-automation-id="login_error_message">
            {this.props.messages[ this.props.loginError ]
              ? <FormattedMessage {...this.props.messages[ this.props.loginError ]} />
              : <FormattedMessage {...this.props.messages.genericLoginError} />}
          </p>
        </div>
      )
    }
  }

  componentWillUpdate (nextProps) {
    if (this.props.isRequestingLogin && !nextProps.isRequestingLogin) {
      if (recaptchaInstance) {
        recaptchaInstance.reset()
      }
    }
  }

  renderCaptcha () {
    if (this.props.demandCaptcha) {
      return (
          <p className="capthca-container">
            <Recaptcha
              ref={e => recaptchaInstance = e}
              sitekey="6LdrFEYUAAAAAP1dCDklZZPldqgxgJozCaVF-aq9"
              hl="no"
              verifyCallback={this.props.loginActions.captchaSuccess}
             />
          </p>
      )
    }
  }

  render () {
    return (
      <div data-automation-id="login_modal">

        <button className="close-modal-button" onClick={this.props.modalActions.hideModal}>
          <span className="is-vishidden">Lukk logg-inn-vinduet</span>
            <img className="icon" aria-hidden="true" src="/images/x.svg" />
        </button>

        <form onSubmit={this.handleLogin}>
          <h1><FormattedMessage {...this.props.messages.logIn} /></h1>
          <FormInputField name="username" message={this.props.messages.username} type="text" formName={formName} />
          <FormInputField name="password" message={this.props.messages.password} type="password" formName={formName} />
          {this.renderError()}
          {this.renderCaptcha()}
          <p className="forgot-pin">
            <FormattedMessage {...this.props.messages.forgotPin} />
            <FormattedMessage {...this.props.messages.forgotPinDesc} />
          </p>
          <p>
            <button className="blue-btn" type="submit" disabled={this.props.isRequestingLogin || this.props.isValidatingCaptcha}
                    onClick={this.handleLogin}
                    data-automation-id="login_button">
              <FormattedMessage {...this.props.messages.logIn} />
            </button>
            <Link className="cancel-link" onClick={this.props.modalActions.hideModal}>
              Avbryt
            </Link>
          </p>
          <p>
            Er du ikke registrert? <br />
            <Link to="/register" data-automation-id="registration_link" title="register">Registrer
              deg</Link>
          </p>
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
  registrationActions: PropTypes.object.isRequired,
  successAction: PropTypes.object,
  loginActions: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
  demandCaptcha: PropTypes.bool.isRequired,
  isValidatingCaptcha: PropTypes.bool.isRequired,
  captchaResponse: PropTypes.string,
  loginError: PropTypes.string
}

function mapStateToProps (state) {
  return {
    loginError: state.application.loginError,
    isRequestingLogin: state.application.isRequestingLogin,
    fields: state.form.loginForm ? state.form.loginForm : {},
    demandCaptcha: state.application.demandCaptcha,
    isValidatingCaptcha: state.application.isValidatingCaptcha,
    captchaResponse: state.application.captchaResponse
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

const intlLoginForm = injectIntl(LoginForm)

export { intlLoginForm as LoginForm }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({ form: formName })(intlLoginForm))
