import React, {PropTypes} from 'react'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
import {routerActions} from 'react-router-redux'
import {Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import isEmpty from '../utils/emptyObject'

import * as LoanActions from '../actions/LoanActions'
import * as ReservationActions from '../actions/ReservationActions'
import * as ProfileActions from '../actions/ProfileActions'
import Tabs from '../components/Tabs'
import ClickableElement from '../components/ClickableElement'
import {formatDate} from '../utils/dateFormatter'
import Libraries from '../components/Libraries'
import Loading from '../components/Loading'
import Constants from '../constants/Constants'

class UserLoans extends React.Component {
  // NB: this is a hack, permanent solution comes later
  addWeek (date) {
    if (date) {
      return new Date(Date.parse(`${date}`) + (1000 * 60 * 60 * 24 * 7)).toISOString(1).split('T')[ 0 ]
    } else {
      return 'ukjent'
    }
  }

  renderPickups () {
    if (this.props.loansAndReservations.pickups.length > 0) {
      return (
        <section className="pickup">
          <h1><FormattedMessage {...messages.canBePickedUp} /></h1>
          {this.props.loansAndReservations.pickups.map(item => (
            <article key={item.id}
                       className="single-entry"
                       data-automation-id="UserLoans_pickup"
                       data-recordid={item.recordId}>
              <div className="flex-col media-type">
                {item.mediaType !== null
                  ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} aria-hidden="true" />,
                    <span key="item-text" data-automation-id="UserLoans_pickup_type">{this.props.intl.formatMessage({ id: item.mediaType })}</span>])
                  : null
                }
              </div>
              <div className="flex-col entry-details">
                  <Link to={item.relativePublicationPath} data-automation-id="UserLoans_pickup_title">
                    {item.title}
                  </Link>
                  <h2>
                  {!isEmpty(item.contributor)
                    ? (<Link
                      data-automation-id="UserLoans_pickup_author"
                      to={fieldQueryLink('aktør', item.contributor.contributorName)}>
                      {item.contributor.contributorName}
                      </Link>)
                    : null
                  }
                  </h2>
                  <h2 data-automation-id="UserLoans_pickup_author" className="contributors">{item.author}</h2>
                </div>
                <div className="flex-col loan-expire">
                  <h2><FormattedMessage {...messages.expiry} />:</h2>
                  {item.expirationDate
                    ? (<p data-automation-id="UserLoans_pickup_expiry">{formatDate(this.addWeek(item.expirationDate))}</p>)
                    : (<p data-automation-id="UserLoans_pickup_expiry">?</p>)
                    }
                </div>
                <div className="flex-col loan-pickup-number">
                  <h2><FormattedMessage {...messages.pickupNumber} />:</h2>
                  <p data-automation-id="UserLoans_pickup_pickupNumber">{item.pickupNumber}</p>
                </div>
                <div className="flex-col loan-pickup-location">
                  <h2><FormattedMessage {...messages.pickupLocation} />:</h2>
                  <p
                    data-automation-id="UserLoans_pickup_branch">{this.props.intl.formatMessage({ id: item.branchCode })}</p>
                </div>
                <div className="flex-col placeholder-column" />
                <div className="flex-col cancel-button">
                  <ClickableElement onClickAction={this.props.reservationActions.startCancelReservation}
                                    onClickArguments={item.id}>
                    <button className="black-btn" data-automation-id="cancel_reservation_button">
                      <FormattedMessage {...messages.cancelReservation} />
                    </button>
                  </ClickableElement>
                </div>
              </article>
            ))}
        </section>
      )
    }
  }
  renderReservations () {
    if ([ ...this.props.loansAndReservations.reservations ].length > 0) {
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
          {[ ...this.props.loansAndReservations.reservations ].sort((a, b) => a.queuePlace > b.queuePlace).map(item => (
            <article key={item.id}
                     className="single-entry"
                     data-automation-id="UserLoans_reservation"
                     data-recordid={item.recordId}>

              <div className="flex-col media-type">
                {item.mediaType !== null
                ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} aria-hidden="true" />,
                  <span key="item-text" data-automation-id="UserLoans_reservation_type">{this.props.intl.formatMessage({ id: item.mediaType })}</span>])
                  : null
                }
              </div>
              <div className="flex-col entry-details">
                <Link to={item.relativePublicationPath} data-automation-id="UserLoans_reservation_title">
                  {item.title}
                </Link>
                <h2>
                  {!isEmpty(item.contributor)
                    ? (<Link
                      data-automation-id="UserLoans_reservation_author"
                      to={fieldQueryLink('aktør', item.contributor.contributorName)}>
                      {item.contributor.contributorName}
                    </Link>)
                    : null
                  }
                </h2>
              </div>
              <div className="flex-col pickup-location">
                <h2><FormattedMessage {...messages.pickupLocation} />:</h2>
                {this.renderLibrarySelect(item)}
              </div>
              <div className="flex-col placeholder-column" />
              <div className="flex-col place-in-queue">
                <h2><FormattedMessage {...messages.placeInQueue} />:</h2>
                <p data-automation-id="UserLoans_reservation_queue_place">{item.queuePlace > 0
                  ? item.queuePlace
                  : <FormattedMessage {...messages.enRoute} />}
                  &nbsp;{item.suspendUntil
                    ? <span className="feedback"><FormattedMessage {...messages.putOnHold} /> {formatDate(item.suspendUntil)}</span>
                    : ''
                  }
                </p>
              </div>

              <div className="flex-col resume-suspend-button">
                {this.renderResumeSuspendReservationButton(item)}
              </div>
              <div className="flex-col reserve-cancel-button">
                <ClickableElement onClickAction={this.props.reservationActions.startCancelReservation}
                                    onClickArguments={item.id}>
                  <button className="black-btn" data-automation-id="cancel_reservation_button">
                    <FormattedMessage {...messages.cancelReservation} />
                  </button>
                </ClickableElement>
              </div>
            </article>
          ))}
        </NonIETransitionGroup>
      )
    }
  }

  renderLibrarySelect (item) {
    return (
      <div className="select-branch">
        {this.props.isRequestingChangePickupLocation === item.id
          ? <Loading />
          : (
          <div className="select-container" data-automation-id="UserLoans_reservation_library">
            <Libraries libraries={this.props.libraries}
                       selectedBranchCode={item.branchCode}
                       disabled={(this.props.isRequestingChangePickupLocation !== false || item.itype === 'REALIA')}
                       onChangeAction={this.props.reservationActions.changePickupLocation}
                       reserveId={item.id} />
          </div>
        )}
      </div>)
  }

  renderResumeSuspendReservationButton (item) {
    console.log('Change reserve', this.props.isRequestingChangeReservationSuspension)
    return (
      <div>
        {this.props.isRequestingChangeReservationSuspension === item.id
          ? <Loading />
          : (
          <ClickableElement onClickAction={this.props.reservationActions.suspendReservation}
                            onClickArguments={[ item.id, !item.suspended ]}>
            <button className={`${item.suspended ? 'black-btn red-btn' : 'black-btn'} ${item.queuePlace === '0' ? 'is-hidden' : ''}`}
                    disabled={this.props.isRequestingChangeReservationSuspension !== false}
                    data-automation-id={item.suspended ? 'resume_reservation_button' : 'suspend_reservation_button'}>
              {item.suspended
                ? <span><span className="btn-icon"><i className="icon-play" aria-hidden="true" /></span><FormattedMessage {...messages.resumeReservation} /></span>
                : <span><span className="btn-icon"><i className="icon-pause" aria-hidden="true" /></span><FormattedMessage {...messages.suspendReservation} /></span>}
            </button>
          </ClickableElement>
        )}
      </div>
    )
  }

  renderWaitingPeriod (expected = 'unknown') {
    if (expected === 'unknown') {
      return <FormattedMessage {...messages.unknown} />
    } else {
      return <span>({this.renderExpectedEstimationPrefix(expected)} {expected} <FormattedMessage {...messages.weeks} />)</span>
    }
  }
  // <FormattedMessage {...messages.name} values={{ name: this.props.borrowerName }} />
  // &nbsp;-&nbsp;{this.renderCurrentDateTime()}
  renderLoans () {
    if ([ ...this.props.loansAndReservations.loans ].length > 0) {
      return (
        <section className="loan">
          <div className="loan-header">
            <h1>
              <FormattedMessage {...messages.yourLoans} />
            </h1>
            {this.renderRenewAllButton()}
          </div>
          {[ ...this.props.loansAndReservations.loans ].sort((a, b) => a.dueDate > b.dueDate).map(item => (
            <article key={item.id}
                     className="single-entry"
                     data-automation-id="UserLoans_loan"
                     data-recordid={item.recordId}>
              <div className="flex-col media-type">
                {item.mediaType !== null
                  ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} aria-hidden="true" />,
                    <span key="item-text" data-automation-id="UserLoans_reservation_type">{this.props.intl.formatMessage({ id: item.mediaType })}
                    </span>])
                  : null
                }
              </div>
              <div className="flex-col entry-details">
                <Link to={item.relativePublicationPath} data-automation-id="UserLoans_loan_title">
                  {item.title}
                </Link>
                <h2>
                  {!isEmpty(item.contributor)
                    ? (<Link
                      data-automation-id="UserLoans_loan_author"
                      to={fieldQueryLink('aktør', item.contributor.contributorName)}>
                      {item.contributor.contributorName}
                    </Link>)
                    : null
                  }
                </h2>
                <h2>{this.renderPublishedDate(item.publicationYear)}</h2>
              </div>
              <div className="flex-col due-date">
                {item.renewalStatus === 'genericExtendLoanSuccess'
                  ? <span className="success">{this.renderDueDate(item)}</span>
                  : <span>{this.renderDueDate(item)}</span>}
              </div>
              <div className="flex-col extend-msg">
                {this.renderExtendLoanMessage(item)}
              </div>
              <div className="flex-col placeholder-column" />
              <div className="flex-col renew-button">
                <ClickableElement onClickAction={this.props.loanActions.startExtendLoan}
                                  onClickArguments={item.id}>
                  <button className="black-btn" disabled={item.renewalStatus}>
                    <FormattedMessage {...messages.extendLoan} />
                  </button>
                </ClickableElement>
              </div>
            </article>
          ))}
        </section>
      )
    }
  }

  renderRenewAllButton () {
    if ([ ...this.props.loansAndReservations.loans ].length > 0) {
      return (
        <ClickableElement onClickAction={this.props.loanActions.startExtendAllLoans}
                          onClickArguments={[this.props.loansAndReservations.loans]}>
          <button className="renew-all-button black-btn"
                  disabled={this.props.hasRequestedRenewAll}
                  data-automation-id="UserLoans_extend_all_loans_button">
              <FormattedMessage {...messages.renewAllLoans} />
          </button>
        </ClickableElement>
      )
    }
  }

  renderExtendLoanMessage (item) {
    if (item.renewalStatus) {
      return (
        item.renewalStatus === 'genericExtendLoanSuccess'
          ? <div className="renew-message success"><p><FormattedMessage {...messages[ item.renewalStatus ]} /></p></div>
          : <div className="renew-message fail"><p><FormattedMessage {...messages[ item.renewalStatus ]} /></p></div>
      )
    }
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

  renderDueDate (item) {
    if (item.dueDate) {
      return (
      item.renewalStatus !== 'overdue'
        ? <div>
          <h2><FormattedMessage {...messages.dueDate} />:</h2>
          <p data-automation-id="UserLoans_loan_dueDate">{formatDate(item.dueDate)}</p>
        </div>
        : <div>
          <h2><FormattedMessage {...messages.dueDate} />:</h2>
          <p className="fail" data-automation-id="UserLoans_loan_dueDate">{formatDate(item.dueDate)}</p>
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
  intl: intlShape.isRequired,
  isRequestingExtendLoan: PropTypes.bool.isRequired,
  isRequestingExtendAllLoans: PropTypes.bool.isRequired,
  hasRequestedRenewAll: PropTypes.bool.isRequired
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
    defaultMessage: 'Cancel'
  },
  yourLoans: {
    id: 'UserLoans.yourLoans',
    description: 'The header over the current loans',
    defaultMessage: 'Your loans'
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
  unknown: {
    id: 'UserLoans.unknown',
    description: 'Text displayed when unable to estimate waiting period',
    defaultMessage: '(Unknown waiting period)'
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
  },
  putOnHold: {
    id: 'UserLoans.putOnHold',
    description: 'Message that the reservation is put on hold',
    defaultMessage: 'Put on hold until'
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
  },
  tooSoonToRenew: {
    id: 'UserLoans.tooSoonToRenew',
    description: 'Message when it is too early for renewing loan.',
    defaultMessage: 'Too early to extend'
  },
  tooManyRenewals: {
    id: 'UserLoans.tooManyRenewals',
    description: 'Message when material has reached maximum number of renewals.',
    defaultMessage: 'Can not be extended anymore'
  },
  materialIsReserved: {
    id: 'UserLoans.materialIsReserved',
    description: 'Message when material is reserved and cannot be reserved.',
    defaultMessage: 'Reserved - cannot extend'
  },
  patronHasRestriction: {
    id: 'UserLoans.patronHasRestriction',
    description: 'Message when restricted patron is trying to renew material.',
    defaultMessage: 'Not able to extend - Please contact library for details'
  },
  patronHasOverdue: {
    id: 'UserLoans.patronHasOverdue',
    description: 'Message when patron with overdues is trying to renew material.',
    defaultMessage: 'Overdue material - cannot renew.'
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
    borrowerName: state.profile.borrowerName,
    isRequestingExtendLoan: state.loan.isRequestingExtendLoan,
    isRequestingExtendAllLoans: state.loan.isRequestingExtendAllLoans,
    hasRequestedRenewAll: state.loan.hasRequestedRenewAll
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
