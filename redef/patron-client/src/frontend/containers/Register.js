import PropTypes from 'prop-types'
import React from 'react'
import { connect } from 'react-redux'
import { destroy } from 'redux-form'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import FormPartOne from './forms/RegistrationFormPartOne'
import FormPartTwo from './forms/RegistrationFormPartTwo'
import FormPartThree from './forms/RegistrationFormPartThree'

class Register extends React.Component {

  renderSuccess () {
    // Manually destroy registration forms
    this.props.dispatch(destroy('registrationPartOne'))
    this.props.dispatch(destroy('registrationPartTwo'))
    this.props.dispatch(destroy('registrationPartThree'))

    return (
      <div data-automation-id="registration_success_modal" className="default-form">
        <form>
          <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
          <p>
            {this.props.categoryCode === 'REGBARN'
              ? <span data-automation-id="category" className="juvenile">
                  <FormattedMessage {...messages.patronCategoryJuvenile} /><br />
                  <FormattedMessage {...messages.messageSuccessJuvenile} /><br />
                </span>
              : <span data-automation-id="category" className="adult">
                  <FormattedMessage {...messages.patronCategoryAdult} /><br />
                  <FormattedMessage {...messages.messageSuccessAdult} /><br />
                </span>
            }
            <span data-automation-id="username">{this.props.username}</span>
          </p>
        </form>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id="registration_error_modal" className="default-form">
        <form>
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericRegistrationError} />}
        </p>
        </form>
      </div>
    )
  }

  render () {
    if (this.props.isError) {
      return this.renderError()
    }
    return (
      <section className="register-page default-form">
        <div data-automation-id="registration_modal">
          {(this.props.stepNumber === 1 || this.props.stepNumber === 2) && <FormPartOne /> }
          {this.props.stepNumber === 2 && <FormPartTwo /> }
          {this.props.stepNumber === 3 && <FormPartThree /> }
          {this.props.stepNumber === 4 && this.renderSuccess() }
        </div>
      </section>
    )
  }
}

Register.propTypes = {
  dispatch: PropTypes.func.isRequired,
  username: PropTypes.string,
  message: PropTypes.string,
  isError: PropTypes.bool,
  isSuccess: PropTypes.bool,
  stepNumber: PropTypes.number,
  isCheckingForExistingUser: PropTypes.bool,
  checkForExistingUserSuccess: PropTypes.bool,
  categoryCode: PropTypes.string,
  intl: intlShape.isRequired
}

const intlRegister = injectIntl(Register)
export { intlRegister as Register }

function mapStateToProps (state) {
  return {
    username: state.registration.username,
    categoryCode: state.registration.categoryCode,
    isError: state.registration.isError,
    isSuccess: state.registration.isSuccess,
    stepNumber: state.registration.stepNumber,
    isCheckingForExistingUser: state.registration.isCheckingForExistingUser,
    checkForExistingUserSuccess: state.registration.checkForExistingUserSuccess
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch
  }
}

export const messages = defineMessages({
  button: {
    id: 'Registration.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'Close'
  },
  cancel: {
    id: 'Registration.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'Registration.headerTextSuccess',
    description: 'Message upon successful registration',
    defaultMessage: 'Success! You are now ready to reserve and loan books at Deichman'
  },
  messageSuccessAdult: {
    id: 'Registration.messageSuccessAdult',
    description: 'The registration success message for adults',
    defaultMessage: 'Welcome as a new user of our library. A temporary user id is given below. Please contact library to get a library card.'
  },
  patronCategoryAdult: {
    id: 'Registration.patronCategoryAdult',
    description: 'The patron category message for adults',
    defaultMessage: 'Patron category: adult'
  },
  messageSuccessJuvenile: {
    id: 'Registration.messageSuccessJuvenile',
    description: 'The registration success message for juvenile',
    defaultMessage: 'Welcome as juvenile user of our library. A temporary user id is given below. Please contact library to get a library card.'
  },
  patronCategoryJuvenile: {
    id: 'Registration.patronCategoryJuvenile',
    description: 'The patron category message for juvenile',
    defaultMessage: 'Patron category: juvenile'
  },
  headerTextError: {
    id: 'Registration.headerTextError',
    description: 'The header text for the registration error dialog',
    defaultMessage: 'Failure'
  },
  genericRegistrationError: {
    id: 'Registration.genericRegistrationError',
    description: 'A generic message when registration goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Something went wrong when registering loaner. Please try again later.'
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Register))
