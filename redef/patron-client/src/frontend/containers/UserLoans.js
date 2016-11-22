import React, { PropTypes } from 'react'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage, intlShape } from 'react-intl'
import { routerActions } from 'react-router-redux'
import MediaQuery from 'react-responsive'

import * as LoanActions from '../actions/LoanActions'
import * as ReservationActions from '../actions/ReservationActions'
import * as ProfileActions from '../actions/ProfileActions'
import Tabs from '../components/Tabs'
import ClickableElement from '../components/ClickableElement'
import { formatDate } from '../utils/dateFormatter'
import Libraries from '../components/Libraries'
import Loading from '../components/Loading'

class UserLoans extends React.Component {
  renderPickups () {
    return (
      <section className="pickup">
        <h1><FormattedMessage {...messages.canBePickedUp} /></h1>
        {this.props.loansAndReservations.pickups.map(item => (
          <article key={item.pickupNumber}
                   className="single-entry"
                   data-automation-id="UserLoans_pickup"
                   data-recordid={item.recordId}>
            <div className="entry-details">
              <h1 data-automation-id="UserLoans_pickup_title">{item.title}</h1>
              <h2 data-automation-id="UserLoans_pickup_author" className="contributors">{item.author}</h2>
            </div>
            <div className="loan-pickup-location">
              <h2><FormattedMessage {...messages.pickupLocation} />:</h2>
              <p
                data-automation-id="UserLoans_pickup_branch">{this.props.intl.formatMessage({ id: item.branchCode })}</p>
            </div>
            <div className="loan-expire">
              <h2><FormattedMessage {...messages.expiry} />:</h2>
              <p data-automation-id="UserLoans_pickup_expiry">{formatDate(item.expiry)}</p>
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
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="reserve">
        <h1><FormattedMessage {...messages.reservations} /></h1>

        <MediaQuery query="(min-width: 992px)" values={{ ...this.props.mediaQueryValues }}>
          <table>
            <thead>
            <tr>
              <th><FormattedMessage {...messages.title} /></th>
              <th><FormattedMessage {...messages.author} /></th>
              <th><FormattedMessage {...messages.orderedDate} /></th>
              <th><FormattedMessage {...messages.pickupLocation} /></th>
              <th><FormattedMessage {...messages.placeInQueue} /></th>
            </tr>
            </thead>
            <tbody>{[ ...this.props.loansAndReservations.reservations ].sort((a, b) => a.queuePlace > b.queuePlace).map(item => (
              <tr key={item.reserveId} data-automation-id="UserLoans_reservation" data-recordid={item.recordId}>
                <td data-automation-id="UserLoans_reservation_title">{item.title}</td>
                <td data-automation-id="UserLoans_reservation_author">{item.author}</td>
                <td data-automation-id="UserLoans_reservation_orderedDate">{formatDate(item.orderedDate)}</td>
                <td data-automation-id="UserLoans_reservation_library">{this.props.libraries[ item.branchCode ]}</td>
                <td>
                  <span data-automation-id="UserLoans_reservation_queue_place">{item.queuePlace}</span>
                  <span>&nbsp;</span>
                  <span data-automation-id="UserLoans_reservation_waitingPeriod">({this.renderExpectedEstimationPrefix(item.expected)} {item.expected} <FormattedMessage {...messages.weeks} />)</span>
                </td>
                <td>
                  {this.renderResumeSuspendReservationButton(item)}
                </td>
                <td>
                  {this.renderResumeSuspendReservationButton(item)}
                </td>
                <td>
                  {this.renderResumeSuspendReservationButton(item)}
                </td>
                <td>
                  <ClickableElement onClickAction={this.props.reservationActions.startCancelReservation}
                                    onClickArguments={item.reserveId}>
                    <button className="black-btn" data-automation-id="cancel_reservation_button">
                      <FormattedMessage {...messages.cancelReservation} />
                    </button>
                  </ClickableElement>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </MediaQuery>

        <MediaQuery query="(max-width: 991px)" values={{ ...this.props.mediaQueryValues }}>
          <div>
            {[ ...this.props.loansAndReservations.reservations ].sort((a, b) => a.queuePlace > b.queuePlace).map(item => (
              <div className="reserved-entry-content"
                   key={item.reserveId}
                   data-automation-id="UserLoans_reservation"
                   data-recordid={item.recordId}>
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
                    {formatDate(item.orderedDate)}
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
                    <FormattedMessage {...messages.placeInQueue} />
                  </div>
                  <div className="meta-content">
                    <span data-automation-id="UserLoans_reservation_queue_place">{item.queuePlace}</span>
                    <span>&nbsp;</span>
                    <span data-automation-id="UserLoans_reservation_waitingPeriod">({this.renderExpectedEstimationPrefix(item.expected)} {item.expected} <FormattedMessage {...messages.weeks} />)</span>
                  </div>
                </div>
                <div className="meta-item">
                  <div className="meta-label">
                    <FormattedMessage {...messages.pickupLocation} />
                  </div>
                  <div className="meta-content" data-automation-id="UserLoans_reservation_library">
                    {this.renderLibrarySelect(item)}
                  </div>
                </div>
                <div className="meta-item">
                  {this.renderResumeSuspendReservationButton(item)}
                </div>
                <div className="meta-item">
                  <ClickableElement onClickAction={this.props.reservationActions.startCancelReservation}
                                    onClickArguments={item.reserveId}>
                    <button className="black-btn" data-automation-id="cancel_reservation_button">
                      <FormattedMessage {...messages.cancelReservation} />
                    </button>
                  </ClickableElement>
                </div>
              </div>
            ))}
          </div>
        </MediaQuery>
      </NonIETransitionGroup>
    )
  }

  renderLibrarySelect (item) {
    return (
      <div className="select-branch">
        {this.props.isRequestingChangePickupLocation === item.reserveId
          ? <Loading />
          : (
          <div className="select-container">
            <Libraries libraries={this.props.libraries}
                       selectedBranchCode={item.branchCode}
                       disabled={this.props.isRequestingChangePickupLocation !== false}
                       onChangeAction={this.props.reservationActions.changePickupLocation}
                       reserveId={item.reserveId} />
          </div>
        )}
      </div>)
  }

  renderResumeSuspendReservationButton (item) {
    return (
      <div>
        {this.props.isRequestingChangeReservationSuspension === item.reserveId
          ? <Loading />
          : (
          <ClickableElement onClickAction={this.props.reservationActions.changeReservationSuspension}
                            onClickArguments={[ item.reserveId, !item.suspended ]}>
            <button className={item.suspended ? 'red-btn' : 'black-btn'}
                    disabled={this.props.isRequestingChangeReservationSuspension !== false}
                    data-automation-id={item.suspended ? 'resume_reservation_button' : 'suspend_reservation_button'}>
              {item.suspended
                ? <FormattedMessage {...messages.resumeReservation} />
                : <FormattedMessage {...messages.suspendReservation} />}
            </button>
          </ClickableElement>
        )}
      </div>
    )
  }

  renderWaitingPeriod (expected = 'unknown') {
    if (expected === 'pending') {
      return <FormattedMessage {...messages.pending} />
    } else if (expected === 'unknown') {
      return <FormattedMessage {...messages.unknown} />
    } else {
      return <span>({this.renderExpectedEstimationPrefix(expected)} {expected} <FormattedMessage {...messages.weeks} />)</span>
    }
  }

  renderLoans () {
    return (
      <section className="registered">
        <h1>
          <FormattedMessage {...messages.name} values={{ name: this.props.borrowerName }} />
          {this.renderCurrentDateTime()}
        </h1>
        <button className="black-btn patron-placeholder">
          <FormattedMessage {...messages.renewAllLoans} />
        </button>
        {[ ...this.props.loansAndReservations.loans ].sort((a, b) => a.dueDate > b.dueDate).map(item => (
          <article key={item.checkoutId}
                   className="single-entry"
                   data-automation-id="UserLoans_loan"
                   data-recordid={item.recordId}>
            <div className="entry-details">
              <h1 data-automation-id="UserLoans_loan_title">{item.title}</h1>
              <h2 data-automation-id="UserLoans_loan_author" className="contributors">{item.author}</h2>
              <h2>{this.renderPublishedDate(item.publicationYear)}</h2>
            </div>
            {this.renderDueDate(item.dueDate)}
            <div className="prolong">
              <ClickableElement onClickAction={this.props.loanActions.startExtendLoan}
                                onClickArguments={item.checkoutId}>
                <button className="black-btn">
                  <FormattedMessage {...messages.extendLoan} />
                </button>
              </ClickableElement>
            </div>
          </article>
        ))}
      </section>
    )
  }

  renderCurrentDateTime () {
    const dateTime = new Intl.DateTimeFormat('nb', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    }).format(Date.now())
    return (
      <span className="date">{dateTime}</span>
    )
  }

  renderDueDate (dueDate) {
    if (dueDate) {
      return (
        <div className="due-date">
          <h2><FormattedMessage {...messages.dueDate} />:</h2>
          <p data-automation-id="UserLoans_loan_dueDate">{formatDate(dueDate)}</p>
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

    renderExpectedEstimationPrefix (estimate) {
        return estimate.includes('–')
            ? <FormattedMessage {...messages.approx} />
    : <FormattedMessage {...messages.moreThan} />
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
  isRequestingChangeReservationSuspension: PropTypes.oneOfType([ PropTypes.bool, PropTypes.string ]).isRequired,
  isRequestingChangePickupLocation: PropTypes.oneOfType([ PropTypes.bool, PropTypes.string ]).isRequired,
  borrowerName: PropTypes.string.isRequired,
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
  },
  placeInQueue: {
    id: 'UserLoans.placeInQueue',
    description: 'The header over a reservations\' place in holds queue',
    defaultMessage: 'Place in queue'
  },
  unknown: {
    id: 'UserLoans.unknown',
    description: 'Text displayed when unable to estimate waiting period',
    defaultMessage: '(Unknown waiting period)'
  },
  pending: {
    id: 'UserLoans.pending',
    description: 'Text displayed when a loan is pending',
    defaultMessage: '(Soon available)'
  },
  enRoute: {
    id: 'UserLoans.enRoute',
    description: 'Text displayed when item is en route',
    defaultMessage: 'En route'
  },
  approx: {
    id: 'UserLoans.approximately',
    description: 'The abbreviation used to mean approximately',
    defaultMessage: 'approx.'
  },
  weeks: {
    id: 'UserLoans.weeks',
    description: 'The word used to mean weeks',
    defaultMessage: 'weeks'
  },
  moreThan: {
    id: 'UserLoans.moreThan',
    description: 'The words used to mean more than',
    defaultMessage: 'more than'
  },
  suspendReservation: {
    id: 'UserLoans.suspendReservation',
    description: 'Text when button suspends the reservation',
    defaultMessage: 'Suspend'
  },
  enRoute: {
    id: 'UserLoans.enRoute',
    description: 'Text displayed when item is en route',
    defaultMessage: 'En route'
  },
  suspendReservation: {
    id: 'UserLoans.suspendReservation',
    description: 'Text when button suspends the reservation',
    defaultMessage: 'Suspend'
  },
  resumeReservation: {
    id: 'UserLoans.resumeReservation',
    description: 'Text when button resumes the reservation',
    defaultMessage: 'Resume'
  }
})

function mapStateToProps (state) {
  return {
    loansAndReservationError: state.profile.loansAndReservationError,
    isRequestingLoansAndReservations: state.profile.isRequestingLoansAndReservations,
    loansAndReservations: state.profile.loansAndReservations,
    libraries: state.application.libraries,
    isRequestingChangePickupLocation: state.reservation.isRequestingChangePickupLocation,
    isRequestingChangeReservationSuspension: state.reservation.isRequestingChangeReservationSuspension,
    borrowerName: state.profile.borrowerName
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
