import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as LoginActions from '../actions/LoginActions'
import * as ModalActions from '../actions/ModalActions'

const Login = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    isLoggedIn: PropTypes.bool.isRequired,
    loginActions: PropTypes.object.isRequired,
    modalActions: PropTypes.object.isRequired,
    isRequestingLogin: PropTypes.bool.isRequired,
    successAction: PropTypes.object,
    loginError: PropTypes.string,
    intl: intlShape.isRequired
  },
  componentWillMount () {
    if (this.props.isLoggedIn) {
      this.props.dispatch(this.props.successAction || ModalActions.hideModal())
    }
  },
  handleLogin (event) {
    event.preventDefault()
    this.props.loginActions.login(
      this.usernameInput.value,
      this.passwordInput.value,
      this.props.successAction || ModalActions.hideModal()
    )
  },
  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  },
  renderError () {
    if (this.props.loginError) {
      return (
        <p data-automation-id='login_error_message'>
          {messages[ this.props.loginError ]
            ? <FormattedMessage {...messages[ this.props.loginError ]} />
            : <FormattedMessage {...messages.genericLoginError} />}
        </p>
      )
    }
  },
  render () {
    return (
      <div data-automation-id='login_modal'>
        <form onSubmit={this.handleLogin}>
          <p><FormattedMessage {...messages.username} /></p>
          <input name='username' ref={e => this.usernameInput = e} type='text' />
          <br />
          <p><FormattedMessage {...messages.password} /></p>
          <input ref={e => this.passwordInput = e} type='password' />
          <br />
          <br />
          <button disabled={this.props.isRequestingLogin} onClick={this.handleLogin}
                  data-automation-id='login_button'>
            <FormattedMessage {...messages.logIn} />
          </button>
          <button disabled={this.props.isRequestingLogin} onClick={this.handleCancel}
                  data-automation-id='cancel_login_button'>
            <FormattedMessage {...messages.cancel} />
          </button>
        </form>
        {this.renderError()}
      </div>
    )
  }
})

const messages = defineMessages({
  username: {
    id: 'Login.username',
    description: 'The label over the username field',
    defaultMessage: 'Username:'
  },
  password: {
    id: 'Login.password',
    description: 'The label over the password field',
    defaultMessage: 'Password:'
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
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingLogin: state.application.isRequestingLogin,
    loginError: state.application.loginError
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    loginActions: bindActionCreators(LoginActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

const intlLogin = injectIntl(Login)
export { intlLogin as Login }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(intlLogin)
