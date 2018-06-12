import PropTypes from 'prop-types'
import React from 'react'
import { reduxForm, reset } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import FormInputField from '../../components/FormInputField'
import * as LoanActions from '../../actions/LoanActions'

const formName = 'sendReceipt'

class EmailReceiptForm extends React.Component {
  constructor (props) {
    super(props)
    this.handleSendReceipt = this.handleSendReceipt.bind(this)
    this.getValidator = this.getValidator.bind(this)
  }

  handleSendReceipt () {
    this.props.loanActions.sendReceiptForm(reset('requestReceipt'), this.props.transactionId, this.props.authorizationId, this.props.successfulExtends)
  }

  getValidator (field) {
    if (field && field.meta.touched && field.meta.error) {
      return <div style={{ color: 'red', fontSize: '12px' }}>{this.props.intl.formatMessage(field.meta.error)}</div>
    }
  }

  render () {
    const {
      submitting,
      handleSubmit
    } = this.props
    return (
      <form initialValues={{foo: 'bar'}} onChange={this.handleChange} onSubmit={handleSubmit(this.handleSendReceipt)}>
        <section className="email-receipt">
          <div className="email-receipt-fields">
            <FormInputField name="email"
                            message={messages.email}
                            headerType=""
                            type="text"
                            formName={formName}
                            getValidator={this.getValidator} />



          {!this.props.sendPaymentReceiptSuccess &&
            <button className="blue-btn" type="submit" disabled={submitting} data-automation-id="emailReceiptForm_button">
              <FormattedMessage {...messages.sendPaymentReceipt} /><br />
            </button>
          }
          {this.props.sendPaymentReceiptSuccess ? <div data-automation-id="emailReceiptForm_success" style={{ color: 'green' }}>
            <FormattedMessage {...messages.sendPaymentReceiptSuccess} />
          </div> : null}
          {this.props.sendPaymentReceiptError ? <div data-automation-id="emailReceiptForm_success" style={{ color: 'red' }}>
            <FormattedMessage {...messages.sendPaymentReceiptError} />
          </div> : null}
          </div>

        </section>
      </form>
    )
  }
}

export const messages = defineMessages({
  email: {
    id: 'UserLoans.email',
    description: 'The label for the email',
    defaultMessage: 'Email:'
  },
  sendPaymentReceipt: {
    id: 'UserLoans.sendPaymentReceipt',
    description: 'Send payment receipt',
    defaultMessage: 'Send receipt on email'
  },
  sendPaymentReceiptSuccess: {
    id: 'UserLoans.sendPaymentReceiptSuccess',
    description: 'Receipt was sent ok',
    defaultMessage: 'Your receipt was sent.'
  },
  sendPaymentReceiptError: {
    id: 'UserLoans.sendPaymentReceiptError',
    description: 'Receipt was not sent ok',
    defaultMessage: 'Your receipt could not be sent.'
  },
  emailRequired: {
    id: 'UserLoans.sendPaymentReceiptEmailRequired',
    description: 'Email is required',
    defaultMessage: 'Email is required'
  }
})

EmailReceiptForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loanActions: PropTypes.object.isRequired,
  sendPaymentReceiptSuccess: PropTypes.bool.isRequired,
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  sendPaymentReceiptError: PropTypes.object,
  transactionId: PropTypes.string.isRequired,
  authorizationId: PropTypes.string.isRequired,
  successfulExtends: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    sendPaymentReceiptError: state.loan.sendPaymentReceiptError,
    sendPaymentReceiptSuccess: state.loan.sendPaymentReceiptSuccess,
    initialValues: state.profile.personalInformation,
    fields: state.form.sendReceipt ? state.form.sendReceipt : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    loanActions: bindActionCreators(LoanActions, dispatch)
  }
}

const validate = (values, props) => {
  const errors = {}
  if (!values.email) {
    errors.email = messages.sendPaymentReceiptEmailRequired
  }
  console.log('validating', errors)
  return errors
}

const intlEmailReceiptForm = injectIntl(EmailReceiptForm)
export { intlEmailReceiptForm as EmailReceiptForm }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({ form: formName, validate })(intlEmailReceiptForm))
