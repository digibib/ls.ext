import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { Link, browserHistory } from 'react-router'
import { push } from 'react-router-redux'

import FormInputField from '../components/FormInputField'
import * as LoginActions from '../actions/LoginActions'
import * as RegistrationActions from '../actions/RegistrationActions'
const formName = 'loginForm'

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
  }

  handleLogin (event) {
    event.preventDefault()
    this.props.loginActions.login(
      this.props.fields.values.username,
      this.props.fields.values.password,
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

  render () {
    return (
      <section className="login-page default-form">
        <form onSubmit={this.handleLogin}>
          {this.renderError()}
          <h1><FormattedMessage {...messages.logIn} /></h1>
          <FormInputField name="username" message={messages.username} type="text" formName={formName} />
          <FormInputField name="password" message={messages.password} type="password" formName={formName} />
          <p>
            <button className="black-btn" type="submit" disabled={this.props.isRequestingLogin}
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
  fields: PropTypes.object.isRequired,
  borrowerNumber: PropTypes.string,
  location: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  registrationActions: PropTypes.object.isRequired,
  isRequestingLogin: PropTypes.bool.isRequired
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
    isRequestingLogin: state.application.isRequestingLogin
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
