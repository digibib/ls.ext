import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as ModalActions from '../../actions/ModalActions'
import LoginForm from '../forms/LoginForm'

class LoginModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
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

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  render () {
    return (
      <section className="login-modal">
        {this.renderError()}
        <LoginForm successAction={this.props.successAction} messages={messages} />
      </section>
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

LoginModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  successAction: PropTypes.object,
  loginError: PropTypes.string,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    loginError: state.application.loginError
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

const intlLogin = injectIntl(LoginModal)
export { intlLogin as Login }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(intlLogin)

