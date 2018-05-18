import PropTypes from 'prop-types'
import React from 'react'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
import {routerActions} from 'react-router-redux'
import {Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import Tooltip from 'react-tooltip-component'

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

  renderWaitingPeriodInit (item, onlyShowQueueSpot) {
    if (item.queuePlace > 0) {
      if (onlyShowQueueSpot) {
        return <span data-automation-id="UserLoans_reservation_queue_place">
          {item.queuePlace}
        </span>
      }
      return <span>
        <span data-automation-id="UserLoans_reservation_queue_place">{item.queuePlace}</span> &nbsp; {this.renderWaitingPeriod(item.estimate)}
        <Tooltip title={this.props.intl.formatMessage(messages.waitingTime)} position="top">
          <button className="btn btn-default">
            <img className="icon" style={{ fontSize: 16, marginTop: '-5px' }} src="/images/question.svg" />
          </button>
        </Tooltip>
      </span>
    } else {
      return <FormattedMessage {...messages.enRoute} />
    }
  }

  renderPickups () {
    if ([ ...this.props.loansAndReservations.pickups ].length > 0) {
      return (
        <section className="pickup">
          <h1><FormattedMessage {...messages.canBePickedUp} /></h1>
          {this.props.loansAndReservations.pickups.map(item => (
            <article key={item.id}
                       className="single-entry"
                       data-automation-id="UserLoans_pickup"
                       data-recordid={item.recordId}>
              <div className="flex-col media-type">
                {item.mediaType
                  ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} aria-hidden="true" />,
                    <span key="item-text" data-automation-id="UserLoans_pickup_type">{this.props.intl.formatMessage({ id: item.mediaType })}</span>])
                  : null
                }
              </div>
              <div className="flex-col entry-details">
                  <Link className="publication-title" to={item.relativePublicationPath} data-automation-id="UserLoans_pickup_title">
                    {item.title}
                  </Link>
                  <h2>{this.renderMainContributors(item)}</h2>
                  <h2>{this.renderPublishedDate(item.publicationYear)}</h2>
                </div>
                <div className="flex-col loan-expire">
                  <h2><FormattedMessage {...messages.expiry} />:</h2>
                  {item.expirationDate
                    ? (<p data-automation-id="UserLoans_pickup_expiry">{formatDate(item.expirationDate)}</p>)
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
                    <button className="small-blue-btn" data-automation-id="cancel_reservation_button">
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
  /* TODO: rename reservation -> hold */
  renderReservations () {
    if ([ ...this.props.loansAndReservations.holds ].length > 0) {
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
          {[ ...this.props.loansAndReservations.holds ].sort((a, b) => a.queuePlace > b.queuePlace).map(item => (
            <article key={item.id}
                     className="single-entry"
                     data-automation-id="UserLoans_reservation"
                     data-recordid={item.recordId}>

              <div className="flex-col media-type">
                {item.mediaType
                ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} aria-hidden="true" />,
                  <span key="item-text" data-automation-id="UserLoans_reservation_type">{this.props.intl.formatMessage({ id: item.mediaType })}</span>])
                  : null
                }
              </div>
              <div className="flex-col entry-details">
                <Link className="publication-title" to={item.relativePublicationPath} data-automation-id="UserLoans_reservation_title">
                  {item.title}
                </Link>
                <h2>{this.renderMainContributors(item)}</h2>
                <h2>{this.renderPublishedDate(item.publicationYear)}</h2>
              </div>
              <div className="flex-col pickup-location">
                {this.props.patronCategory !== 'IL'
                  ? (<div>
                      <h2><FormattedMessage {...messages.pickupLocation} />:</h2>
                      {this.renderLibrarySelect(item)}
                    </div>)
                  : null
                }
              </div>
              <div className="flex-col placeholder-column" />
              <div className="flex-col place-in-queue">
                <div>
                  <h2><FormattedMessage {...messages.placeInQueue} />:</h2>
                  <p>
                    {item.suspendUntil
                      ? <span data-automation-id="Userloans_reservation_suspend_message" className="feedback"><FormattedMessage {...messages.putOnHold} /> {formatDate(item.suspendUntil)}</span>
                      : this.renderWaitingPeriodInit(item, this.props.patronCategory === 'IL')
                    }
                  </p>
                </div>
              </div>
              <div className="flex-col resume-suspend-button">
                {this.renderResumeSuspendReservationButton(item)}
              </div>
              <div className="flex-col reserve-cancel-button">
                <ClickableElement onClickAction={this.props.reservationActions.startCancelReservation}
                                    onClickArguments={item.id}>
                  <button className="small-blue-btn" data-automation-id="cancel_reservation_button">
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

  renderReservationsFromRemoteLibraries () {
    if ([ ...this.props.loansAndReservations.remoteholds ].length > 0) {
      return (
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="section"
          className="reserve">
          <h1><FormattedMessage {...messages.remoteReservations} /></h1>
          {[ ...this.props.loansAndReservations.remoteholds ].sort((a, b) => a.queuePlace > b.queuePlace).map(item => (
            <article key={item.id}
                     className="single-entry"
                     data-automation-id="UserLoans_remoteHold"
                     data-recordid={item.recordId}>

              <div className="flex-col media-type">
                {item.mediaType
                ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} aria-hidden="true" />,
                  <span key="item-text" data-automation-id="UserLoans_remoteHold_type">{this.props.intl.formatMessage({ id: item.mediaType })}</span>])
                  : null
                }
              </div>
              <div className="flex-col entry-details">
                <span className="publication-title" data-automation-id="UserLoans_remoteHold_title">{item.title}</span>
                <h2>{this.renderMainContributors(item)}</h2>
                <h2>{this.renderPublishedDate(item.publicationYear)}</h2>
              </div>
              <div className="flex-col pickup-location">
                {this.props.patronCategory !== 'IL'
                  ? (<div>
                      <h2><FormattedMessage {...messages.pickupLocation} />:</h2>
                      {this.renderLibrarySelect(item)}
                    </div>)
                  : null
                }
              </div>
              <div className="flex-col placeholder-column" />
              <div className="flex-col place-in-queue" />
              <div className="flex-col placeholder-column" />
              <div className="flex-col reserve-cancel-button">
                <ClickableElement onClickAction={this.props.reservationActions.startCancelReservation}
                                    onClickArguments={item.id}>
                  <button className="small-blue-btn" data-automation-id="cancel_reservation_button">
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
    const suspended = item.suspended === '1'
    return (
      <div>
        {this.props.isRequestingChangeReservationSuspension === item.id
          ? <Loading />
          : (
          <ClickableElement onClickAction={this.props.reservationActions.suspendReservation}
                            onClickArguments={[ item.id, !suspended ]}>
            <button className={`${suspended ? 'small-blue-btn' : 'small-blue-btn'} ${item.queuePlace === '0' ? 'is-hidden' : ''}`}
                    disabled={this.props.isRequestingChangeReservationSuspension !== false}
                    data-automation-id={suspended ? 'resume_reservation_button' : 'suspend_reservation_button'}>
              {suspended
                ? <span><span className="btn-icon"><img className="icon" src="/images/play.svg" aria-hidden="true" /></span><FormattedMessage {...messages.resumeReservation} /></span>
                : <span><span className="btn-icon"><img className="icon" src="/images/pause.svg" aria-hidden="true" /></span><FormattedMessage {...messages.suspendReservation} /></span>}
            </button>
          </ClickableElement>
        )}
      </div>
    )
  }

  renderWaitingPeriod (expected) {
    if (expected.error != null) {
      return <FormattedMessage {...messages.unknown} />
    } else {
      const numWeeks = Math.floor(expected.estimate / 7)
      const estimate = (numWeeks < 11) ? `${numWeeks}–${numWeeks + 2}` : '11'
      return <span>({this.renderExpectedEstimationPrefix(estimate)} {estimate} <FormattedMessage {...messages.weeks} />)</span>
    }
  }

  renderLoansWithFines (loans, fineId) {
    return (
      <section className="loan">
        <div className="loan-header">
          <h1>
            <FormattedMessage {...messages.yourLoansWithFine} />
          </h1>
          <p>
            <FormattedMessage {...messages.payFineInformation} />
          </p>
          {this.renderPayFineButton(fineId)}
          {this.renderRenewAllButton(true)}
        </div>
        <div className="loan fine">
          {this.renderLoans(loans, true)}
        </div>

      </section>
    )
  }

  renderLoansWithoutFines (loans, hasFines) {
    return (
      <section className="loan">
        <div className="loan-header">
          <h1>
            <FormattedMessage {...messages.yourLoans} />
          </h1>
          {this.renderRenewAllButton(hasFines)}
        </div>
        <div className="loan">
          {this.renderLoans(loans, hasFines)}
        </div>
      </section>
    )
  }

  renderLoans (loans, withFines) {
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
              <div className={item.isFine ? 'flex-col due-date fine-info' : 'flex-col due-date'}>
                {item.renewalStatus === 'genericExtendLoanSuccess'
                  ? <span className="success">{this.renderDueDate(item)}</span>
                  : <span>{this.renderDueDate(item)}</span>}
              </div>
              {item.isFine &&
                <div className="flex-col extend-msg fine-info">
                  <p>Knyttet til gebyr</p>
                </div>
              }
              {!withFines &&
                <div className="flex-col ">
                  {this.renderExtendLoanMessage(item)}
                </div>
              }

              <div className="flex-col placeholder-column" />
              <div className="flex-col renew-button">
                <ClickableElement onClickAction={this.props.loanActions.startExtendLoan}
                                  onClickArguments={item.id}>
                  <button className="small-blue-btn" disabled={item.renewalStatus || withFines}>
                    <FormattedMessage {...messages.extendLoan} />
                  </button>
                </ClickableElement>
              </div>
            </article>
          ))}
        </div>
      )
    }
  }

  renderLoansFromRemoteLibraries () {
    if ([ ...this.props.loansAndReservations.remoteloans ].length > 0) {
      return (
        <section className="loan">
          <div className="loan-header">
            <h1>
              <FormattedMessage {...messages.yourRemoteLoans} />
            </h1>
            <FormattedMessage {...messages.howToManageYourRemoteLoans} />
          </div>
          {[ ...this.props.loansAndReservations.remoteloans ].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).map(item => (
            <article key={item.id}
                     className="single-entry"
                     data-automation-id="UserLoans_remoteLoan"
                     data-recordid={item.recordId}>
              <div className="flex-col media-type">
                {item.mediaType
                  ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ item.mediaType ] ]} aria-hidden="true" />,
                    <span key="item-text" data-automation-id="UserLoans_remoteLoan_type">{this.props.intl.formatMessage({ id: item.mediaType })}
                    </span>])
                  : null
                }
              </div>
              <div className="flex-col entry-details">
                <span className="publication-title" data-automation-id="UserLoans_remoteLoan_title">{item.title}</span>
                <h2>{this.renderMainContributors(item)}</h2>
                <h2>{this.renderPublishedDate(item.publicationYear)}</h2>
              </div>
              <div className="flex-col due-date">
                {item.renewalStatus === 'genericExtendLoanSuccess'
                  ? <span className="success">{this.renderDueDate(item)}</span>
                  : <span>{this.renderDueDate(item)}</span>}
              </div>
              <div className="flex-col placeholder-column" />
              <div className="flex-col placeholder-column" />
              <div className="flex-col placeholder-column" />
            </article>
          ))}
        </section>
      )
    }
  }

  renderPayFineButton (fineId) {
    return (
      <ClickableElement onClickAction={this.props.loanActions.startPayFine} onClickArguments={fineId} >
        <button className="small-blue-btn pay-fine-button"
                data-automation-id="UserLoans_pay_fine_button">
            <FormattedMessage {...messages.payFineButtonText} />
        </button>
      </ClickableElement>
    )
  }

  renderRenewAllButton (withFines) {
    if ([ ...this.props.loansAndReservations.loans ].length > 0) {
      return (
        <ClickableElement onClickAction={this.props.loanActions.startExtendAllLoans}
                          onClickArguments={[this.props.loansAndReservations.loans]}>
          <button className="renew-all-button small-blue-btn"
                  disabled={this.props.hasRequestedRenewAll || withFines}
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
    const loans = [ ...this.props.loansAndReservations.loans ]
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .filter(loan => loan.isFine !== true)
    const loansWithFines = [ ...this.props.loansAndReservations.loans ]
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .filter(loan => loan.isFine === true)
    let fineId = -1
    if (loansWithFines.length > 0) {
      fineId = loansWithFines[0].fineId
    }
    console.log('fineId', fineId)
    if (this.props.isRequestingLoansAndReservations) {
      return <div style={{textAlign: 'center'}}>
        <span data-automation-id="is_searching" className="loading-spinner">
          <i className="icon-spin4 animate-spin" style={{color: 'red', fontSize: '2em'}} />
        </span>
      </div>
    } else if (this.props.loansAndReservationError) {
      return <FormattedMessage {...messages.loansAndReservationError} />
    }
    return (
      <div>
        {this.renderPickups()}
        {loansWithFines.length > 0 &&
           this.renderLoansWithFines(loansWithFines, fineId)}
        {this.renderLoansWithoutFines(loans, loansWithFines.length > 0)}
        {this.renderLoansFromRemoteLibraries()}
        {this.renderReservations()}
        {this.renderReservationsFromRemoteLibraries()}
      </div>
    )
  }
}

UserLoans.propTypes = {
  patronCategory: PropTypes.string,
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
  waitingTime: {
    id: 'UserLoans.waitingTime',
    description: 'The waiting time explanation text',
    defaultMessage: 'Expected waiting time is a rough estimate, accuracy may vary.'
  },
  waitingPeriod: {
    id: 'UserLoans.waitingPeriod',
    description: 'The label of the waiting period of the reservation',
    defaultMessage: 'Waiting period'
  },
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
  yourRemoteLoans: {
    id: 'UserLoans.yourRemoteLoans',
    description: 'The header over the current remote loans',
    defaultMessage: 'Your remote loans'
  },
  yourLoansWithFine: {
    id: 'UserLoans.yourLoansWithFine',
    description: 'The header over the current loans with fine',
    defaultMessage: 'Loans with fine'
  },
  howToManageYourRemoteLoans: {
    id: 'UserLoans.howToManageYourRemoteLoans',
    description: 'Message explaining how to manage remote loans',
    defaultMessage: 'Please get in contact with library staff to ask for extension'
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
  remoteReservations: {
    id: 'UserLoans.remoteReservations',
    description: 'The header of the remote reservations section',
    defaultMessage: 'Remote Reservations'
  },
  renewAllLoans: {
    id: 'UserLoans.renewAllLoans',
    description: 'The label for the renew all loans button',
    defaultMessage: 'Renew all loans'
  },
  payFineInformation: {
    id: 'UserLoans.payFineInformation',
    description: 'The label for the pay fine button',
    defaultMessage: 'Pay fine'
  },
  payFineButtonText: {
    id: 'UserLoans.payFineButtonText',
    description: 'The label for the pay fine button',
    defaultMessage: 'Pay fine 100-,'
  },
  approx: {
    id: 'UserLoans.approximately',
    description: 'The abbreviation used to mean approximately',
    defaultMessage: '~'
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
    patronCategory: state.profile.category,
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
