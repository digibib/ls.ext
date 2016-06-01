import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as ReservationActions from '../actions/ReservationActions'
import * as ModalActions from '../actions/ModalActions'

class ExtendLoan extends React.Component {
  constructor (props) {
    super(props)
    this.handleExtendLoan = this.handleExtendLoan.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleExtendLoan (event) {
    event.preventDefault()
    this.props.reservationActions.extendLoan(this.props.checkoutId)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSuccess () {
    return (
      <div data-automation-id='reservation_success_modal' className='default-modal'>
        <h2><FormattedMessage {...messages.headerTextSuccess} /></h2>
        <p>
          <FormattedMessage {...messages.messageSuccess} />
        </p>
        <button onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id='reservation_error_modal' className='default-modal'>
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericExtendLoanError} />}
        </p>
        <button onClick={this.props.modalActions.hideModal}>
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
      <div data-automation-id='extend_loan_modal' className='default-modal'>
        <h2>{this.props.message}</h2>
        <button disabled={this.props.isRequestingExtendLoan} onClick={this.handleExtendLoan}
                data-automation-id='confirm_button'>
          <FormattedMessage {...messages.extendLoan} />
        </button>
        <button disabled={this.props.isRequestingExtendLoan} onClick={this.handleCancel}
                data-automation-id='cancel_button'>
          <FormattedMessage {...messages.cancel} />
        </button>
      </div>
    )
  }
}

const messages = defineMessages({
  button: {
    id: 'ExtendLoan.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'Close'
  },
  extendLoan: {
    id: 'ExtendLoan.extendLoan',
    description: 'The extend reservation button text',
    defaultMessage: 'Extend reservation'
  },
  cancel: {
    id: 'ExtendLoan.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'ExtendLoan.headerTextSuccess',
    description: 'The header text for the extend loan success dialog',
    defaultMessage: 'Success!'
  },
  messageSuccess: {
    id: 'ExtendLoan.messageSuccess',
    description: 'The extend loan success message',
    defaultMessage: 'The loan is now extended.'
  },
  headerTextError: {
    id: 'ExtendLoan.headerTextError',
    description: 'The header text for the extend loan error dialog',
    defaultMessage: 'Failure'
  },
  genericExtendLoanError: {
    id: 'ExtendLoan.genericExtendLoanError',
    description: 'A generic message when extending the loan goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Something went wrong when attempting to extend loan!'
  }
})

ExtendLoan.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  reservationActions: PropTypes.object.isRequired,
  checkoutId: PropTypes.string.isRequired,
  isRequestingExtendLoan: PropTypes.bool.isRequired,
  message: PropTypes.string,
  isError: PropTypes.bool,
  isSuccess: PropTypes.bool,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingExtendLoan: state.reservation.isRequestingExtendLoan,
    loginError: state.application.loginError
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

const intlExtendLoan = injectIntl(ExtendLoan)
export { intlExtendLoan as ExtendLoan }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(intlExtendLoan)
