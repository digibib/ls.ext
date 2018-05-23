import React from 'react'
import PropTypes from 'prop-types'
import {Redirect, Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
import QueryString from 'query-string'
import {formatDate} from '../utils/dateFormatter'

import * as LoanActions from '../actions/LoanActions'

class PaymentResponse extends React.Component {

  componentDidMount () {
    const transactionId = QueryString.parse(this.props.location.search).transactionId
    const responseCode = QueryString.parse(this.props.location.search).responseCode
    if('OK' === responseCode) {
      this.props.loanActions.processFinePayment(transactionId)
    }
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

  renderLoans (loans) {
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
                Hello
              </div>
            </article>
          ))}
        </div>
      )
    }
  }

  render () {

    const responseCode = QueryString.parse(this.props.location.search).responseCode
    const loans = [ ...this.props.loansAndReservations.loans ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))

    if(this.props.isSavingPayment || this.props.isRequestingLoansAndReservations) {
      return (
        <div style={{textAlign: 'center'}}>
          <span data-automation-id="is_searching" className="loading-spinner">
            <i className="icon-spin4 animate-spin" style={{color: 'red', fontSize: '2em'}} />
          </span>
        </div>
      )
    }

    return (
      <div>
        <section>
          <div className="payment-response-header">
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
        <section className="loan">
          <div className="loan-header">
            <h1>
              Se over disse lånene
            </h1>
          </div>
          {this.renderLoans(loans)}
        </section>

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
  dueDate: {
    id: 'UserLoans.dueDate',
    description: 'The due date of a reservation',
    defaultMessage: 'Due date'
  }
})

PaymentResponse.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loanActions: PropTypes.object.isRequired,
  loansAndReservations: PropTypes.object.isRequired,
  isSavingPayment: PropTypes.bool.isRequired,
  isPaymentSaved: PropTypes.bool.isRequired
}

function mapStateToProps (state) {
  return {
    loansAndReservations: state.profile.loansAndReservations,
    isSavingPayment: state.loan.isSavingPayment,
    isPaymentSaved: state.loan.isPaymentSaved
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
