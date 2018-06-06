import React from 'react'
import PropTypes from 'prop-types'
import {Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
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

  renderDueDate (item, successfulExtends) {
    if (item.dueDate) {
      if (successfulExtends.includes(item.id)) {
        return (
          <div className="flex-col due-date">
            <div>
              <h2><FormattedMessage {...messages.newDueDate} />:</h2>
              <p data-automation-id="UserLoans_dueDate">{formatDate(item.dueDate)}</p>
            </div>
          </div>
        )
      }
    }
  }

  renderPublishedDate (publicationYear) {
    if (publicationYear) {
      return (
        <span className="published" data-automation-id="UserLoans_publicationYear">{publicationYear}</span>
      )
    }
  }

  renderLoans (loans, successfulExtends) {
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
              {this.renderDueDate(item, successfulExtends)}
              <div className="flex-col extend-msg">
                {successfulExtends.includes(item.id) &&
                  <p>
                    <FormattedMessage {...messages.genericExtendLoanSuccess} />
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
                <FormattedMessage {...messages.paymentFailedText} values={{ myPageLink: <Link to="/profile/loans" ><FormattedMessage {...messages.myProfile} /> </Link> }} />
              </p>
            </div>
          </section>
        </div>
      )
    }

    const loans = [ ...this.props.loansAndReservations.loans ]
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .filter(loan => {
        return (this.props.successfulExtends.includes(loan.id))
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
                <FormattedMessage {...messages.paymentLoansUpdatedHeader} />
              </h1>
            </div>
            {this.renderLoans(loans, this.props.successfulExtends)}
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
    defaultMessage: 'We have now renewed those loaned items that were possible to renew. Items reserved by other users cannot be renewed, and must be returned as soon as possible in order to avoid replacement charge.'
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
  myProfile: {
    id: 'SearchHeader.myProfile',
    description: 'My Page',
    defaultMessage: 'My Page'
  },
  paymentLoansUpdatedHeader: {
    id: 'UserLoans.paymentLoansUpdatedHeader',
    description: 'Header for updated loans info',
    defaultMessage: 'Here is an overview of your loaned items'
  },
  paymentFailedText: {
    id: 'UserLoans.paymentFailedText',
    description: 'Information text for a failed payment',
    defaultMessage: 'Please return to {myPageLink} to initiate the payment again, or contact your local library.'
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
  newDueDate: {
    id: 'UserLoans.newDueDate',
    description: 'The due date of a reservation',
    defaultMessage: 'New due date'
  },
  genericExtendLoanSuccess: {
    id: 'UserLoans.genericExtendLoanSuccess',
    description: 'A generic message for successful renewal.',
    defaultMessage: 'The item is renewed'
  },
  genericExtendLoanError: {
    id: 'UserLoans.genericExtendLoanError',
    description: 'A generic message when extending the loan goes wrong, which can be caused by server errors, network problems etc.',
    defaultMessage: 'Not able to extend - Please contact library for details'
  },
  too_soon: {
    id: 'UserLoans.tooSoonToRenew',
    description: 'Message when it is too early for renewing loan.',
    defaultMessage: 'Too early to extend'
  },
  too_many: {
    id: 'UserLoans.tooManyRenewals',
    description: 'Message when material has reached maximum number of renewals.',
    defaultMessage: 'Can not be extended anymore'
  },
  on_reserve: {
    id: 'UserLoans.materialIsReserved',
    description: 'Message when material is reserved and cannot be reserved.',
    defaultMessage: 'This item is reserved and must be returned as soon as possible in order to avoid replacement charge'
  },
  restriction: {
    id: 'UserLoans.patronHasRestriction',
    description: 'Message when restricted patron is trying to renew material.',
    defaultMessage: 'Not able to extend - Please contact library for details'
  },
  overdue: {
    id: 'UserLoans.patronHasOverdue',
    description: 'Message when patron with overdues is trying to renew material.',
    defaultMessage: 'Overdue material - cannot renew.'
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
  location: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  isRequestingLoansAndReservations: PropTypes.bool.isRequired
}

function mapStateToProps (state) {
  return {
    loansAndReservations: state.profile.loansAndReservations,
    isSavingPayment: state.loan.isSavingPayment,
    isPaymentSaved: state.loan.isPaymentSaved,
    isPaymentCancelled: state.loan.isPaymentCancelled,
    isPaymentFailed: state.loan.isPaymentFailed,
    successfulExtends: state.loan.successfulExtends,
    isRequestingLoansAndReservations: state.profile.isRequestingLoansAndReservations
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
