import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { Link, browserHistory } from 'react-router'
import { push } from 'react-router-redux'
import Recaptcha from 'react-recaptcha'

import FormInputField from '../components/FormInputField'
import * as LoginActions from '../actions/LoginActions'
import * as RegistrationActions from '../actions/RegistrationActions'
const formName = 'loginForm'

let recaptchaInstance

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
  }

  componentWillUpdate (nextProps) {
    if (this.props.isRequestingLogin && !nextProps.isRequestingLogin) {
      if (recaptchaInstance) {
        recaptchaInstance.reset()
      }
    }
  }

  handleLogin (event) {
    event.preventDefault()
    this.props.loginActions.login(
      this.props.fields.values.username,
      this.props.fields.values.password,
      this.props.captchaResponse,
      [push({ pathname: '/profile/loans' })]
    )
  }

  renderError () {
    if (this.props.loginError) {
      return (
        <div className="error-msg">
          <p data-automation-id="login_error_message">
            {messages[ this.props.loginError ]
              ? <FormattedMessage {...messages[ this.props.loginError ]} />
              : <FormattedMessage {...messages.genericLoginError} />}
          </p>
        </div>
      )
    }
  }

  renderCaptcha () {
    if (this.props.demandCaptcha) {
      return (
          <div className="capthca-container">
            <Recaptcha
              ref={e => recaptchaInstance = e}
              sitekey="6LdrFEYUAAAAAP1dCDklZZPldqgxgJozCaVF-aq9"
              hl="no"
              verifyCallback={this.props.loginActions.captchaSuccess}
             />
          </div>
      )
    }
  }

  render () {
    return (
      <section className="login-page default-form">
        <form onSubmit={this.handleLogin}>
          <h1><FormattedMessage {...messages.logIn} /></h1>
          <FormInputField name="username" message={messages.username} type="text" formName={formName} />
          <FormInputField name="password" message={messages.password} type="password" formName={formName} />
          {this.renderError()}
          {this.renderCaptcha()}
          <p>
            <button className="blue-btn" type="submit" disabled={this.props.isRequestingLogin || this.props.isValidatingCaptcha}
                    onClick={this.handleLogin}
                    data-automation-id="login_button">
              <FormattedMessage {...messages.logIn} />
            </button>
            <Link to="#" className="cancel-link" onClick={browserHistory.goBack}>
              Avbryt
            </Link>
          </p>
          <h4>Er du ikke registrert?</h4>
          <p><Link to="/register" data-automation-id="registration_link" title="register">Registrer deg</Link></p>
          <hr />
          <h4><FormattedMessage {...messages.forgotPin} /></h4>
          <p><FormattedMessage {...messages.forgotPinDesc} /></p>
        </form>
      </section>
    )
  }
}

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loginActions: PropTypes.object.isRequired,
  loginError: PropTypes.string,
  demandCaptcha: PropTypes.bool.isRequired,
  fields: PropTypes.object.isRequired,
  borrowerNumber: PropTypes.string,
  location: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  registrationActions: PropTypes.object.isRequired,
  isRequestingLogin: PropTypes.bool.isRequired,
  isValidatingCaptcha: PropTypes.bool.isRequired,
  captchaResponse: PropTypes.string
}

export const messages = defineMessages({
  username: {
    id: 'Login.username',
    description: 'The label over the username field',
    defaultMessage: 'Borrower number or email:'
  },
  password: {
    id: 'Login.password',
    description: 'The label over the password field',
    defaultMessage: 'PIN:'
  },
  logIn: {
    id: 'Login.logIn',
    description: 'The login button text',
    defaultMessage: 'Log in'
  },
  cancel: {
    id: 'Login.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  invalidCredentials: {
    id: 'Login.invalidCredentials',
    description: 'The message shown when the user inputs invalid username and password combination',
    defaultMessage: 'Invalid username and/or password'
  },
  tooManyFailedAttempts: {
    id: 'Login.tooManyFailedAttempts',
    description: 'The message shown when the user inputs invalid username and password combination',
    defaultMessage: 'Invalid username and/or password'
  },
  genericLoginError: {
    id: 'Login.genericLoginError',
    description: 'A generic message for login failures, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Something went wrong when attempting to log in!'
  },
  forgotPin: {
    id: 'Login.forgotPin',
    description: 'Forgot Pin?',
    defaultMessage: 'Forgot pin?'
  },
  forgotPinDesc: {
    id: 'Login.forgotPinDesc',
    description: 'Forgot pin description',
    defaultMessage: 'If you have forgotten you PIN you have to come in to one of our libraries to have it reset. We are working on a better solution to this.'
  }
})

function mapStateToProps (state) {
  return {
    fields: state.form.loginForm ? state.form.loginForm : {},
    loginError: state.application.loginError,
    demandCaptcha: state.application.demandCaptcha,
    isRequestingLogin: state.application.isRequestingLogin,
    isValidatingCaptcha: state.application.isValidatingCaptcha,
    captchaResponse: state.application.captchaResponse
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    loginActions: bindActionCreators(LoginActions, dispatch),
    registrationActions: bindActionCreators(RegistrationActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({ form: formName })(injectIntl(Login)))
