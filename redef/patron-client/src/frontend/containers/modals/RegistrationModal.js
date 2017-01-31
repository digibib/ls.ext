import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as ModalActions from '../../actions/ModalActions'

import FormPartTwo from '../forms/RegistrationFormPartTwo'
import NameAndSsnForm from '../forms/RegistrationFormPartOne'

class RegistrationModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSuccess () {
    return (
      <div data-automation-id="registration_success_modal" className="default-modal">
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
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id="registration_error_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericRegistrationError} />}
        </p>
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  render () {
    if (this.props.isError) {
      return this.renderError()
    } else if (this.props.isSuccess) {
      return this.renderSuccess()
    }
    return (
      <section className="register-modal">
        <button className="close-modal-button" onClick={this.props.modalActions.hideModal}>
          <span className="is-vishidden">Lukk registrerings-vinduet</span>
          <i className="icon-cancel-1" aria-hidden="true" />
        </button>
        <div data-automation-id="registration_modal">
          <NameAndSsnForm />
          {this.props.checkForExistingUserSuccess ? <FormPartTwo /> : null}
        </div>
      </section>
    )
  }
}

export const messages = defineMessages({
  button: {
    id: 'RegistrationModal.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'Close'
  },
  cancel: {
    id: 'RegistrationModal.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'RegistrationModal.headerTextSuccess',
    description: 'Message upon successful registration',
    defaultMessage: 'Success! You are now ready to reserve and loan books at Deichman'
  },
  messageSuccessAdult: {
    id: 'RegistrationModal.messageSuccessAdult',
    description: 'The registration success message for adults',
    defaultMessage: 'Welcome as a new user of our library. A temporary user id is given below. Please contact library to get a library card.'
  },
  patronCategoryAdult: {
    id: 'RegistrationModal.patronCategoryAdult',
    description: 'The patron category message for adults',
    defaultMessage: 'Patron category: adult'
  },
  messageSuccessJuvenile: {
    id: 'RegistrationModal.messageSuccessJuvenile',
    description: 'The registration success message for juvenile',
    defaultMessage: 'Welcome as juvenile user of our library. A temporary user id is given below. Please contact library to get a library card.'
  },
  patronCategoryJuvenile: {
    id: 'RegistrationModal.patronCategoryJuvenile',
    description: 'The patron category message for juvenile',
    defaultMessage: 'Patron category: juvenile'
  },
  headerTextError: {
    id: 'RegistrationModal.headerTextError',
    description: 'The header text for the registration error dialog',
    defaultMessage: 'Failure'
  },
  genericRegistrationError: {
    id: 'RegistrationModal.genericRegistrationError',
    description: 'A generic message when registration goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Something went wrong when registering loaner. Please try again later.'
  }
})

RegistrationModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  username: PropTypes.string,
  message: PropTypes.string,
  isError: PropTypes.bool,
  isSuccess: PropTypes.bool,
  isCheckingForExistingUser: PropTypes.bool,
  checkForExistingUserSuccess: PropTypes.bool,
  categoryCode: PropTypes.string,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    isCheckingForExistingUser: state.registration.isCheckingForExistingUser,
    checkForExistingUserSuccess: state.registration.checkForExistingUserSuccess
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

let intlRegistrationModal = injectIntl(RegistrationModal)

intlRegistrationModal = connect(
  mapStateToProps,
  mapDispatchToProps
)(intlRegistrationModal)

export { intlRegistrationModal as RegistrationModal }

export default intlRegistrationModal
