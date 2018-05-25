import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, FormattedMessage, injectIntl} from 'react-intl'
import QueryString from 'query-string'
import {formatDate} from '../utils/dateFormatter'
import Constants from '../constants/Constants'

import * as LoanActions from '../actions/LoanActions'

class PaymentResponse extends React.Component {

  componentDidMount () {
    const transactionId = QueryString.parse(this.props.location.search).transactionId
    const responseCode = QueryString.parse(this.props.location.search).responseCode
    this.props.loanActions.processFinePayment(transactionId, responseCode)
    window.history.replaceState({}, document.title, '/profile/payment-response')
  }

  renderMainContributors (item) {
    if (item.contributors) {
      const mainEntry = item.contributors.find(c => { return c.mainEntry === true })
      if (mainEntry) {
        return (
          <div>
            <Link data-automation-id="work_contributor_link"
              to={fieldQueryLink('aktør', mainEntry.agent.name)}>
              {mainEntry.agent.name}
            </Link>
          </div>
        )
      }
    } else if (item.author) {
      return <span data-automation-id="UserLoans_author_name">{item.author}</span>
    }
  }

  renderDueDate (item) {
    if (item.dueDate) {
      return (
      item.renewalStatus !== 'overdue'
        ? <div>
          <h2><FormattedMessage {...messages.dueDate} />:</h2>
          <p data-automation-id="UserLoans_dueDate">{formatDate(item.dueDate)}</p>
        </div>
        : <div>
          <h2><FormattedMessage {...messages.dueDate} />:</h2>
          <p className="fail" data-automation-id="UserLoans_dueDate">{formatDate(item.dueDate)}</p>
        </div>
      )
    }
  }

  renderPublishedDate (publicationYear) {
    if (publicationYear) {
      return (
        <span className="published" data-automation-id="UserLoans_publicationYear">{publicationYear}</span>
      )
    }
  }

  renderLoans (loans, successfulExtends, failedExtends) {
    if (loans.length > 0) {
      return (
        <div>
          {loans.map(item => (
            <article key={item.id}
                     className="single-entry"
                     data-automation-id="UserLoans_loan"
                     data-recordid={item.recordId}>
              <div className="flex-col media-type">
                {item.mediaType
                  ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} aria-hidden="true" />,
                    <span key="item-text" data-automation-id="UserLoans_loan_type">{this.props.intl.formatMessage({ id: item.mediaType })}
                    </span>])
                  : null
                }
              </div>
              <div className="flex-col entry-details">
                <Link className="publication-title" to={item.relativePublicationPath} data-automation-id="UserLoans_loan_title">
                  {item.title}
                </Link>
                <h2>{this.renderMainContributors(item)}</h2>
                <h2>{this.renderPublishedDate(item.publicationYear)}</h2>
              </div>
              <div className={(item.isPurresak || item.isKemnersak) ? 'flex-col due-date fine-info' : 'flex-col due-date'}>
                {item.renewalStatus === 'genericExtendLoanSuccess'
                  ? <span className="success">{this.renderDueDate(item)}</span>
                  : <span>{this.renderDueDate(item)}</span>}
              </div>
              <div className="flex-col extend-msg">
                {successfulExtends.includes(item.id) &&
                  <p>
                    <FormattedMessage {...messages.genericExtendLoanSuccess} />
                  </p>
                }
                {failedExtends.includes(item.id) &&
                  <p>
                    <FormattedMessage {...messages.genericExtendLoanError} />
                  </p>
                }
              </div>
            </article>
          ))}
        </div>
      )
    }
  }

  render () {
    if (this.props.isSavingPayment || this.props.isRequestingLoansAndReservations) {
      return (
        <div style={{textAlign: 'center'}}>
          <span data-automation-id="is_searching" className="loading-spinner">
            <i className="icon-spin4 animate-spin" style={{color: 'red', fontSize: '2em'}} />
          </span>
        </div>
      )
    }

    if (this.props.isPaymentCancelled) {
      return (
        <div>
          <section className="loan">
            <div className="loan-header">
              <h1>
                <FormattedMessage {...messages.paymentCancelledHeader} />
              </h1>
            </div>
            <div className="payment-response-text">
              <p>
                <FormattedMessage {...messages.paymentCancelledText} />
              </p>
            </div>
          </section>
          <div>
            <Link to="/profile/loans" >
              <FormattedMessage {...messages.paymentReturnToMypage} />
            </Link >
          </div>
        </div>
      )
    }

    if (this.props.isPaymentFailed) {
      return (
        <div>
          {this.props.isPaymentFailed}
          <section className="loan">
            <div className="loan-header">
              <h1>
                <FormattedMessage {...messages.paymentFailedHeader} />
              </h1>
            </div>
            <div className="payment-response-text">
              <p>
                <FormattedMessage {...messages.paymentFailedText} />
              </p>
            </div>
          </section>
          <div>
            <Link to="/profile/loans" >
              <FormattedMessage {...messages.paymentReturnToMypage} />
            </Link >
          </div>
        </div>
      )
    }

    const loans = [ ...this.props.loansAndReservations.loans ]
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .filter(loan => {
        return (this.props.successfulExtends.includes(loan.id) || this.props.failedExtends.includes(loan.id))
      })
    return (
      <div>
        <section className="loan">
          <div className="loan-header">
            <h1>
              <FormattedMessage {...messages.paymentSuccessHeader} />
            </h1>
          </div>
        <div className="payment-response-text">
          <p>
            <FormattedMessage {...messages.paymentSuccessText} />
          </p>
        </div>
        </section>
        {loans.length > 0 &&
          <section className="loan">
            <div className="loan-header">
              <h1>
                Se over disse lånene
              </h1>
            </div>
            {this.renderLoans(loans, this.props.successfulExtends, this.props.failedExtends)}
          </section>
        }
        <div>
          <Link to="/profile/loans" >
            <FormattedMessage {...messages.paymentReturnToMypage} />
          </Link >
        </div>
      </div>
    )
  }
}

export const messages = defineMessages({
  paymentSuccessHeader: {
    id: 'UserLoans.paymentSuccessHeader',
    description: 'Header for a successful payment',
    defaultMessage: 'Thank you for your payment!'
  },
  paymentSuccessText: {
    id: 'UserLoans.paymentSuccessText',
    description: 'Information text for a successful payment',
    defaultMessage: 'We have extended your loans.'
  },
  paymentCancelledHeader: {
    id: 'UserLoans.paymentCancelledHeader',
    description: 'Header for a cancelled payment',
    defaultMessage: 'Your payment was cancelled'
  },
  paymentCancelledText: {
    id: 'UserLoans.paymentCancelledText',
    description: 'Information text for a successful payment',
    defaultMessage: 'Your payment was cancelled. Please return to My Page to initiate the payment again.'
  },
  paymentFailedHeader: {
    id: 'UserLoans.paymentFailedHeader',
    description: 'Header for a failed payment',
    defaultMessage: 'Your payment failed'
  },
  paymentFailedText: {
    id: 'UserLoans.paymentFailedText',
    description: 'Information text for a successful payment',
    defaultMessage: 'Your payment did not complete ok. Please return to My Page to initiate the payment again or contact your local branch.'
  },
  paymentReturnToMypage: {
    id: 'UserLoans.paymentReturnToMypage',
    description: 'Return to my page text',
    defaultMessage: 'Return to My Page'
  },
  dueDate: {
    id: 'UserLoans.dueDate',
    description: 'The due date of a reservation',
    defaultMessage: 'Due date'
  },
  genericExtendLoanSuccess: {
    id: 'UserLoans.genericExtendLoanSuccess',
    description: 'A generic message for successful renewal.',
    defaultMessage: 'Loan extended'
  },
  genericExtendLoanError: {
    id: 'UserLoans.genericExtendLoanError',
    description: 'A generic message when extending the loan goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Not able to extend - Please contact library for details'
  }
})

PaymentResponse.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loanActions: PropTypes.object.isRequired,
  loansAndReservations: PropTypes.object.isRequired,
  isSavingPayment: PropTypes.bool.isRequired,
  isPaymentSaved: PropTypes.bool.isRequired,
  isPaymentCancelled: PropTypes.bool.isRequired,
  isPaymentFailed: PropTypes.bool.isRequired,
  successfulExtends: PropTypes.array.isRequired,
  failedExtends: PropTypes.array.isRequired
}

function mapStateToProps (state) {
  return {
    loansAndReservations: state.profile.loansAndReservations,
    isSavingPayment: state.loan.isSavingPayment,
    isPaymentSaved: state.loan.isPaymentSaved,
    isPaymentCancelled: state.loan.isPaymentCancelled,
    isPaymentFailed: state.loan.isPaymentFailed,
    successfulExtends: state.loan.successfulExtends,
    failedExtends: state.loan.failedExtends
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    loanActions: bindActionCreators(LoanActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PaymentResponse))
