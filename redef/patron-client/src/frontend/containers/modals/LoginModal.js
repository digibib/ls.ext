import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages } from 'react-intl'

import * as ModalActions from '../../actions/ModalActions'
import LoginForm from '../forms/LoginForm'

class LoginModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  render () {
    return (
      <section className="login-modal">
        <LoginForm successAction={this.props.successAction} messages={messages} />
      </section>
    )
  }
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

LoginModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  successAction: PropTypes.object,
  intl: intlShape.isRequired
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
  mapDispatchToProps
)(intlLogin)

