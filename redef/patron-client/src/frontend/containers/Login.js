import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as LoginActions from '../actions/LoginActions'
import * as ModalActions from '../actions/ModalActions'

class Login extends React.Component {
  constructor (props) {
    super(props)
    this.handleLogin = this.handleLogin.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleLogin (event) {
    event.preventDefault()
    this.props.loginActions.login(
      this.usernameInput.value,
      this.passwordInput.value,
      this.props.successAction ? [ ModalActions.hideModal(), this.props.successAction ] : [ ModalActions.hideModal() ]
    )
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderError () {
    if (this.props.loginError) {
      return (
        <div className='error-msg'>
          <p data-automation-id='login_error_message'>
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
      <div>
        <header>
          {this.renderError()}
        </header>

        <section className='login-modal'>
          <div data-automation-id='login_modal'>

            <form onSubmit={this.handleLogin}>
              <h1>Logg inn for å reservere</h1>
              <h2><FormattedMessage {...messages.username} /></h2>
              <input name='username' ref={e => this.usernameInput = e} type='text' id='username' />
              <h2><FormattedMessage {...messages.password} /></h2>
              <input ref={e => this.passwordInput = e} type='password' />
              <p>Glemt PIN-kode?</p>
              <button className='red-btn' type='button' disabled={this.props.isRequestingLogin}
                      onClick={this.handleLogin}
                      data-automation-id='login_button'>
                <FormattedMessage {...messages.logIn} />
              </button>

              <h3>Er du ikke registrert? <a href='#' title='register'>Registrer deg</a></h3>
            </form>

          </div>

        </section>
      </div>

    )
  }
}

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

Login.propTypes = {
  dispatch: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  loginActions: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
  isRequestingLogin: PropTypes.bool.isRequired,
  successAction: PropTypes.object,
  loginError: PropTypes.string,
  intl: intlShape.isRequired
}

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
