import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as LoanActions from '../actions/LoanActions'
import * as ModalActions from '../actions/ModalActions'

class Registration extends React.Component {
  constructor (props) {
    super(props)
    this.handleRegistration = this.handleRegistration.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleRegistration (event) {
    event.preventDefault()
    this.props.loanActions.registration(this.props.checkoutId)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSuccess () {
    return (
      <div data-automation-id='extend_loan_success_modal' className='default-modal'>
        <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
        <p>
          <FormattedMessage {...messages.messageSuccess} />
        </p>
        <button className='black-btn' onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id='extend_loan_error_modal' className='default-modal'>
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericRegistrationError} />}
        </p>
        <button className='black-btn' onClick={this.props.modalActions.hideModal}>
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
      <div>
        <section className='register-modal'>
          <div data-automation-id='register_modal'>

            <form>
              <h1>Registrer deg som låner</h1>

                            <span className='display-inline'>
                            <h2>Fornavn:</h2>
                            <input name='name' type='text' id='name' />
                            <label for='name'>Fornavn</label>
                                </span>

                            <span className='display-inline'>
                            <h2>Etternavn</h2>
                            <input name='lastname' type='text' id='lastname' />
                            <label for='lastname'>Etternavn</label>
                                </span>


              <div className='date-of-birth'>
                <div className='item'>
                  <h2>Dag</h2>
                  <input name='day' type='number' id='day' />
                  <label for='day'>Dag</label>
                </div>

                <div className='item'>
                  <h2>Måned</h2>
                  <input name='month' type='number' id='month' />
                  <label for='month'>Måned</label>
                </div>

                <div className='item'>
                  <h2>År</h2>
                  <input name='year' type='number' id='year' />
                  <label for='year'>År</label>
                </div>
              </div>

                            <span className='display-inline'>
                            <h2>E-post</h2>
                            <input name='email' type='text' id='email' />
                            <label for='email'>E-post</label>
                                </span>

                            <span className='display-inline'>
                            <h2>Mobil / Telefon</h2>
                            <input name='phone' type='text' id='phone' />
                            <label for='phone'>Telefon</label>
                                </span>

              <address>
                <h2>Adresse</h2>
                <input name='address' type='text' id='address' />
                <label for='address'>Adresse</label>

                                <span className='display-inline'>
                                <h2>Postnr.</h2>
                                <input name='postal' type='text' id='postal' />
                                <label for='postal'>Postnr.</label>
                                    </span>

                                  <span className='display-inline'>
                                    <h2>Poststed</h2>
                                  <input name='city' type='text' name='city' />
                                  <label for='city'>Poststed</label>
                                  </span>

                <h2>Land</h2>
                <label for='country'>Land</label>
                <input name='country' type='text' id='country' />
              </address>

              <h2>Kjønn</h2>
              <div className='select-container'>
                <select>
                  <option>Mann</option>
                  <option>Kvinne</option>
                </select>
              </div>


              <h2>Velg deg en pin kode</h2>
              <input name='code' type='text' id='code' />
              <label for='code'>Velg deg en kode</label>

              <h2>Husk lån etter levering? (Historikk)</h2>
              <input name='yes' type='radio' id='yes' />
              <p className='display-inline'>Ja</p>
              <label for='yes'>Ja</label>

              <input name='no' type='radio' id='no' />
              <p className='display-inline'>Nei</p>
              <label for='code'>Nei</label>


              <button className='red-btn' type='button' disabled={this.props.isRequestingLogin}
                      onClick={this.handleLogin}
                      data-automation-id='login_button'>
                LOG IN
              </button>

              <h3><a href='#' title='register'>Avbryt</a></h3>
            </form>

          </div>

        </section>
      </div>
    )
  }
}

const messages = defineMessages({
  button: {
    id: 'Registration.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'Close'
  },
  registration: {
    id: 'Registration.registration',
    description: 'The extend loan button text',
    defaultMessage: 'Extend loan'
  },
  cancel: {
    id: 'Registration.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'Registration.headerTextSuccess',
    description: 'The header text for the extend loan success dialog',
    defaultMessage: 'Success!'
  },
  messageSuccess: {
    id: 'Registration.messageSuccess',
    description: 'The extend loan success message',
    defaultMessage: 'The loan is now extended.'
  },
  headerTextError: {
    id: 'Registration.headerTextError',
    description: 'The header text for the extend loan error dialog',
    defaultMessage: 'Failure'
  },
  genericRegistrationError: {
    id: 'Registration.genericRegistrationError',
    description: 'A generic message when extending the loan goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Something went wrong when attempting to extend loan!'
  }
})

Registration.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  loanActions: PropTypes.object.isRequired,
  checkoutId: PropTypes.string.isRequired,
  isRequestingRegistration: PropTypes.bool.isRequired,
  message: PropTypes.string,
  isError: PropTypes.bool,
  isSuccess: PropTypes.bool,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingRegistration: state.reservation.isRequestingRegistration,
    loginError: state.application.loginError
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    loanActions: bindActionCreators(LoanActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

const intlRegistration = injectIntl(Registration)
export { intlRegistration as Registration }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(intlRegistration)
