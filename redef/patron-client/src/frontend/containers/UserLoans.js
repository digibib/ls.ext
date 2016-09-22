import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage, intlShape } from 'react-intl'
import { routerActions } from 'react-router-redux'
import MediaQuery from 'react-responsive'

import * as LoanActions from '../actions/LoanActions'
import * as ReservationActions from '../actions/ReservationActions'
import * as ProfileActions from '../actions/ProfileActions'
import Tabs from '../components/Tabs'
import ClickableButton from '../components/ClickableButton'

class UserLoans extends React.Component {
  renderPickups () {
    return (
      <section className="pickup">
        <h1><FormattedMessage {...messages.canBePickedUp} /></h1>
        {this.props.loansAndReservations.pickups.map(item => (
          <article key={item.recordId}
                   className="single-entry"
                   data-automation-id="UserLoans_pickup"
                   data-recordid={item.recordId}
          >
              <div className="entry-details">
                <h1 data-automation-id="UserLoans_pickup_title">{item.title}</h1>
                <h2 className="contributors">{item.author}</h2>
              </div>
              <div className="loan-expire">
                <h2><FormattedMessage {...messages.expiry} />:</h2>
                <p data-automation-id="UserLoans_pickup_expiry">{item.expiry}</p>
              </div>
              <div className="loan-pickup-number">
                <h2><FormattedMessage {...messages.pickupNumber} />:</h2>
                <p data-automation-id="UserLoans_pickup_pickupNumber">{item.pickupNumber}</p>
              </div>
          </article>
        ))}
      </section>
    )
  }

  renderReservations () {
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppear={true}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="reserve">
        <h1><FormattedMessage {...messages.reservations} /></h1>

        <MediaQuery query="(min-width: 992px)" values={{...this.props.mediaQueryValues}}>
          <table>
            <thead>
            <tr>
              <th><FormattedMessage {...messages.title} /></th>
              <th><FormattedMessage {...messages.author} /></th>
              <th><FormattedMessage {...messages.orderedDate} /></th>
              {/*<th><FormattedMessage {...messages.waitingPeriod} /></th>*/}
              <th><FormattedMessage {...messages.pickupLocation} /></th>
            </tr>
            </thead>
            <tbody>{this.props.loansAndReservations.reservations.map(item => (
              <tr key={item.recordId} data-automation-id="UserLoans_reservation" data-recordid={item.recordId}>
                <td data-automation-id="UserLoans_reservation_title">{item.title}</td>
                <td data-automation-id="UserLoans_reservation_author">{item.author}</td>
                <td data-automation-id="UserLoans_reservation_orderedDate">{item.orderedDate}</td>
                {/*<td data-automation-id="UserLoans_reservation_waitingPeriod">{item.waitingPeriod}</td>*/}
                <td data-automation-id="UserLoans_reservation_library">{this.props.libraries[ item.branchCode ]}</td>
                <td>
                  <ClickableButton onClickAction={this.props.reservationActions.startCancelReservation}
                                   onClickArguments={[item.reserveId]}>
                    <FormattedMessage {...messages.cancelReservation} />
                  </ClickableButton>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </MediaQuery>

        <MediaQuery query="(max-width: 991px)" values={{...this.props.mediaQueryValues}}>
          <div>
            {this.props.loansAndReservations.reservations.map(item => (
              <div className="reserved-entry-content"
                   key={item.recordId}
                   data-automation-id="UserLoans_reservation"
                   data-recordid={item.recordId}
              >
                <div className="meta-item">
                  <div className="meta-label">
                    <FormattedMessage {...messages.title} />
                  </div>
                  <div className="meta-content" data-automation-id="UserLoans_reservation_title">
                    {item.title}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">
                    <FormattedMessage {...messages.orderedDate} />
                  </div>
                  <div className="meta-content" data-automation-id="UserLoans_reservation_orderedDate">
                    {item.orderedDate}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">
                    <FormattedMessage {...messages.author} />
                  </div>
                  <div className="meta-content" data-automation-id="UserLoans_reservation_author">
                    {item.author}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">
                    <FormattedMessage {...messages.waitingPeriod} />
                  </div>
                  <div className="meta-content" data-automation-id="UserLoans_reservation_waitingPeriod">
                    {item.waitingPeriod}
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">
                    <FormattedMessage {...messages.pickupLocation} />
                  </div>
                  <div className="meta-content" data-automation-id="UserLoans_reservation_library">
                    {this.props.libraries[ item.branchCode ]}
                  </div>
                </div>
                <div className="meta-item">
                  <ClickableButton onClickAction={this.props.reservationActions.startCancelReservation}
                                     onClickArguments={[item.reserveId]}>
                  <FormattedMessage {...messages.cancelReservation} />
                  </ClickableButton>
                </div>
              </div>
            ))}
          </div>
        </MediaQuery>
      </ReactCSSTransitionGroup>
    )
  }

  renderLoans () {
    return (
      <section className="registered">
        <h1>
          <FormattedMessage {...messages.name} values={{name: this.props.loansAndReservations.name}} />
          {this.renderCurrentDateTime()}
        </h1>
        <button className="black-btn patron-placeholder">
          <FormattedMessage {...messages.renewAllLoans} />
        </button>
        {this.props.loansAndReservations.loans.map(item => (
          <article key={item.recordId}
                   className="single-entry"
                   data-automation-id="UserLoans_loan"
                   data-recordid={item.recordId}>
            <div className="entry-details">
              <h1 data-automation-id="UserLoans_loan_title">{item.title}</h1>
              <h2 className="contributors">{item.author}</h2>
              <h2>{this.renderPublishedDate(item.publicationYear)}</h2>
            </div>
            {this.renderDueDate(item.dueDate)}
            <div className="prolong">
              <ClickableButton onClickAction={this.props.loanActions.startExtendLoan} onClickArguments={[item.checkoutId]}>
                <FormattedMessage {...messages.extendLoan} />
              </ClickableButton>
            </div>
          </article>
        ))}
      </section>
    )
  }

  renderCurrentDateTime () {
    const year = this.props.intl.formatDate(Date.now(), {'year': 'numeric'})
    const month = this.props.intl.formatDate(Date.now(), {'month': 'numeric'})
    const day = this.props.intl.formatDate(Date.now(), {'day': 'numeric'})
    const time = this.props.intl.formatTime(Date.now())
    return (
      <span className="date">{year}.{month}.{day} - {time}</span>
    )
  }

  renderDueDate (dueDate) {
    if (dueDate) {
      const day = this.props.intl.formatDate(dueDate, {'day': 'numeric'})
      const month = this.props.intl.formatDate(dueDate, {'month': 'numeric'})
      const year = this.props.intl.formatDate(dueDate, {'year': 'numeric'})
      return (
        <div className="due-date">
          <h2><FormattedMessage {...messages.dueDate} />:</h2>
          <p data-automation-id="UserLoans_loan_dueDate">{day}.{month}.{year}</p>
        </div>
      )
    }
  }

  renderPublishedDate (publicationYear) {
    if (publicationYear) {
      return (
        <span className="published" data-automation-id="UserLoans_loan_publicationYear">{publicationYear}</span>
      )
    }
  }

  renderTabs () {
    const tabList = [
      { label: 'Oversikt', path: '/profile/loans/overview' },
      { label: 'Historikk', path: '/profile/loans/history' }
    ]
    return <Tabs push={this.props.routerActions.push}
                 tabList={tabList}
                 tabBarClass="tab-bar-secondary"
                 tabClass="tab-bar-tab-small"
                 tabActiveClass="tab-bar-tab-small-active"
                 currentPath={this.props.location.pathname} />
  }

  render () {
    if (this.props.isRequestingLoansAndReservations) {
      return <div />
    } else if (this.props.loansAndReservationError) {
      return <FormattedMessage {...messages.loansAndReservationError} />
    }
    return (
      <div>
        {this.renderPickups()}
        {this.renderReservations()}
        {this.renderLoans()}
      </div>
    )
  }
}

UserLoans.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profileActions: PropTypes.object.isRequired,
  loansAndReservations: PropTypes.object.isRequired,
  routerActions: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  isRequestingLoansAndReservations: PropTypes.bool.isRequired,
  libraries: PropTypes.object.isRequired,
  loanActions: PropTypes.object.isRequired,
  reservationActions: PropTypes.object.isRequired,
  loansAndReservationError: PropTypes.object,
  mediaQueryValues: PropTypes.object,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  title: {
    id: 'UserLoans.title',
    description: 'The label of the item title',
    defaultMessage: 'Title'
  },
  publicationYear: {
    id: 'UserLoans.publicationYear',
    description: 'The label of the publication year of the item',
    defaultMessage: 'Publication year'
  },
  author: {
    id: 'UserLoans.author',
    description: 'The label of the author of the item',
    defaultMessage: 'Author'
  },
  orderedDate: {
    id: 'UserLoans.orderedDate',
    description: 'The label of the ordered date of the reservation',
    defaultMessage: 'Ordered date'
  },
  waitingPeriod: {
    id: 'UserLoans.waitingPeriod',
    description: 'The label of the waiting period of the reservation',
    defaultMessage: 'Waiting period'
  },
  pickupLocation: {
    id: 'UserLoans.pickupLocation',
    description: 'The label of the pickup location for the item that is ready to be picked up',
    defaultMessage: 'Pickup location'
  },
  canBePickedUp: {
    id: 'UserLoans.canBePickedUp',
    description: 'The header text for the display of items that can be picked up',
    defaultMessage: 'Can be picked up'
  },
  expiry: {
    id: 'UserLoans.expiry',
    description: 'The label of the expiry date for a loan that is ready to be picked up',
    defaultMessage: 'Expiry'
  },
  pickupNumber: {
    id: 'UserLoans.pickupNumber',
    description: 'The pickup number of an item that is ready to be picked up',
    defaultMessage: 'Pickup number'
  },
  dueDate: {
    id: 'UserLoans.dueDate',
    description: 'The due date of a reservation',
    defaultMessage: 'Due date'
  },
  extendLoan: {
    id: 'UserLoans.extendLoan',
    description: 'The label on the button to extend a loan',
    defaultMessage: 'Extend loan'
  },
  cancelReservation: {
    id: 'UserLoans.cancelReservation',
    description: 'The label on the button to cancel a reservation',
    defaultMessage: 'Cancel reservation'
  },
  name: {
    id: 'UserLoans.name',
    description: 'The header over the current loans',
    defaultMessage: 'Loan registered on {name}'
  },
  reservations: {
    id: 'UserLoans.reservations',
    description: 'The header of the reservations section',
    defaultMessage: 'Reservations'
  },
  renewAllLoans: {
    id: 'UserLoans.renewAllLoans',
    description: 'The label for the renew all loans button',
    defaultMessage: 'Renew all loans'
  },
  loansAndReservationError: {
    id: 'UserLoans.loansAndReservationError',
    description: 'The message shown when an error retrieving loans and reservations has occurred',
    defaultMessage: 'Something went wrong retrieving loans and reservations.'
  }
})

function mapStateToProps (state) {
  return {
    loansAndReservationError: state.profile.loansAndReservationError,
    isRequestingLoansAndReservations: state.profile.isRequestingLoansAndReservations,
    loansAndReservations: state.profile.loansAndReservations,
    libraries: state.application.libraries
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch),
    loanActions: bindActionCreators(LoanActions, dispatch),
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    routerActions: bindActionCreators(routerActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserLoans))
