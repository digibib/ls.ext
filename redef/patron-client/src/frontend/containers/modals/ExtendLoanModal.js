import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import * as LoanActions from '../../actions/LoanActions'
import * as ModalActions from '../../actions/ModalActions'

class ExtendLoanModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleExtendLoan = this.handleExtendLoan.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleExtendLoan (event) {
    event.preventDefault()
    this.props.loanActions.extendLoan(this.props.checkoutId)
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  renderSuccess () {
    return (
      <div data-automation-id="extend_loan_success_modal" className="default-modal">
        <h2>
          <FormattedMessage {...messages.messageSuccess} />
        </h2>
        <button className="black-btn" onClick={this.props.modalActions.hideModal}>
          <FormattedMessage {...messages.button} />
        </button>
      </div>
    )
  }

  renderError () {
    return (
      <div data-automation-id="extend_loan_error_modal" className="default-modal">
        <h2><FormattedMessage {...messages.headerTextError} /></h2>
        <p>
          {messages[ this.props.message ]
            ? <FormattedMessage {...messages[ this.props.message ]} />
            : <FormattedMessage {...messages.genericExtendLoanError} />}
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
      <section data-automation-id="extend_loan_modal" className="modal-inner extend-loan-modal default-modal">
        <h2>{this.props.message}Forny</h2>
        <button className="black-btn" disabled={this.props.isRequestingExtendLoan} onClick={this.handleExtendLoan}
                data-automation-id="confirm_button">
          <FormattedMessage {...messages.extendLoan} />
        </button>
        <button className="grey-btn" disabled={this.props.isRequestingExtendLoan} onClick={this.handleCancel}
                data-automation-id="cancel_button">
          <FormattedMessage {...messages.cancel} />
        </button>
      </section>
    )
  }
}

export const messages = defineMessages({
  button: {
    id: 'ExtendLoanModal.button',
    description: 'The button to exit the modal dialog',
    defaultMessage: 'Close'
  },
  extendLoan: {
    id: 'ExtendLoanModal.extendLoan',
    description: 'The extend loan button text',
    defaultMessage: 'Extend loan'
  },
  cancel: {
    id: 'ExtendLoanModal.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  headerTextSuccess: {
    id: 'ExtendLoanModal.headerTextSuccess',
    description: 'The header text for the extend loan success dialog',
    defaultMessage: 'Success!'
  },
  messageSuccess: {
    id: 'ExtendLoanModal.messageSuccess',
    description: 'The extend loan success message',
    defaultMessage: 'The loan is now extended with 14 days.'
  },
  headerTextError: {
    id: 'ExtendLoanModal.headerTextError',
    description: 'The header text for the extend loan error dialog',
    defaultMessage: 'Failure'
  },
  genericExtendLoanError: {
    id: 'ExtendLoanModal.genericExtendLoanError',
    description: 'A generic message when extending the loan goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Can not be extended. This may be bacause you can not extend the loan further, the material is reserved by another, or you have an outstanding fee.'
  }
})

ExtendLoanModal.propTypes = {
  dispatch: PropTypes.func.isRequired,
  modalActions: PropTypes.object.isRequired,
  loanActions: PropTypes.object.isRequired,
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
    loanActions: bindActionCreators(LoanActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch)
  }
}

const intlExtendLoanModal = injectIntl(ExtendLoanModal)
export { intlExtendLoanModal as ExtendLoanModal }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(intlExtendLoanModal)
