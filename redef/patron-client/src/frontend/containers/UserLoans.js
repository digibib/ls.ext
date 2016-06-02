import React, { PropTypes } from 'react'
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
    return this.props.loansAndReservations.pickups.map(item => (
      <section key={item.recordId} className='single-entry' data-automation-id='UserLoans_pickup'
               data-recordid={item.recordId}>
        <aside className='book-cover'><a className='book-cover-item' href=''></a>
        </aside>
        <article className='entry-content'>
          <h1 data-automation-id='UserLoans_pickup_title'>{item.title}</h1>
          <div>
            <div className='contributors'>
              <p>
                <FormattedMessage {...messages.author} />: <a href='#'
                                                              data-automation-id='UserLoans_pickup_author'>{item.author}</a>
              </p>
              <p className='published'><FormattedMessage {...messages.publicationYear} />: <span
                data-automation-id='UserLoans_pickup_publicationYear'>{item.publicationYear}</span></p>
            </div>
            <div>
              <div className='loan-expire'>
                <p><FormattedMessage {...messages.expiry} /></p>
                <h2 data-automation-id='UserLoans_pickup_expiry'>{item.expiry}</h2>
              </div>
              <div className='loan-pickup-number'>
                <p><FormattedMessage {...messages.pickupNumber} /></p>
                <h2 data-automation-id='UserLoans_pickup_pickupNumber'>{item.pickupNumber}</h2>
              </div>
            </div>
          </div>
        </article>
      </section>
    ))
  }

  renderReservations () {
    return (
      <div>
        <MediaQuery query='(min-width: 992px)' values={{...this.props.mediaQueryValues}}>

          <table>
            <thead>
            <tr>
              <th><FormattedMessage {...messages.title} /></th>
              <th><FormattedMessage {...messages.author} /></th>
              <th><FormattedMessage {...messages.orderedDate} /></th>
              <th><FormattedMessage {...messages.waitingPeriod} /></th>
              <th><FormattedMessage {...messages.pickupLocation} /></th>
            </tr>
            </thead>
            <tbody>{this.props.loansAndReservations.reservations.map(item => (
              <tr key={item.recordId} data-automation-id='UserLoans_reservation' data-recordid={item.recordId}>
                <td data-automation-id='UserLoans_reservation_title'>{item.title}</td>
                <td data-automation-id='UserLoans_reservation_author'>{item.author}</td>
                <td data-automation-id='UserLoans_reservation_orderedDate'>{item.orderedDate}</td>
                <td data-automation-id='UserLoans_reservation_waitingPeriod'>{item.waitingPeriod}</td>
                <td data-automation-id='UserLoans_reservation_library'>{this.props.libraries[ item.branchCode ]}</td>
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

        <MediaQuery query='(max-width: 991px)' values={{...this.props.mediaQueryValues}}>
          {this.props.loansAndReservations.reservations.map(item => (
            <div className='reserved-entry-content' key={item.recordId} data-automation-id='UserLoans_reservation'
                 data-recordid={item.recordId}>
              <div className='title'><FormattedMessage {...messages.title} /></div>
              <div className='content' data-automation-id='UserLoans_reservation_title'>{item.title}</div>

              <div className='title'><FormattedMessage {...messages.author} /></div>
              <div className='content' data-automation-id='UserLoans_reservation_author'>{item.author}</div>

              <div className='title'><FormattedMessage {...messages.orderedDate} /></div>
              <div className='content' data-automation-id='UserLoans_reservation_orderedDate'>{item.orderedDate}</div>

              <div className='title'><FormattedMessage {...messages.waitingPeriod} /></div>
              <div className='content'
                   data-automation-id='UserLoans_reservation_waitingPeriod'>{item.waitingPeriod}</div>

              <div className='title'><FormattedMessage {...messages.pickupLocation} /></div>
              <div className='content'
                   data-automation-id='UserLoans_reservation_library'>{this.props.libraries[ item.branchCode ]}</div>

            </div>
          ))}
        </MediaQuery>
      </div>
    )
  }

  renderLoans () {
    return this.props.loansAndReservations.loans.map(item => (
      <section key={item.recordId} className='single-entry' data-automation-id='UserLoans_loan'
               data-recordid={item.recordId}>
        <aside className='book-cover'><a className='book-cover-item' href=''></a>
        </aside>
        <article className='entry-content'>
          <h1 data-automation-id='UserLoans_loan_title'>{item.title}</h1>
          <div>
            <div className='contributors'>
              <p><FormattedMessage {...messages.author} />: <a href='#'
                                                               data-automation-id='UserLoans_loan_author'>{item.author}</a>
              </p>
              <p className='published'><FormattedMessage {...messages.publicationYear} />: <span
                data-automation-id='UserLoans_loan_publicationYear'>{item.publicationYear}</span></p>
            </div>
            <div className='due-date'>
              <div>
                <p><FormattedMessage {...messages.dueDate} /></p>
                <h2 data-automation-id='UserLoans_loan_dueDate'>{item.dueDate}</h2>
              </div>
              <div>
                <ClickableButton onClickAction={this.props.loanActions.startExtendLoan}
                                 onClickArguments={[item.checkoutId]}>
                  <FormattedMessage {...messages.extendLoan} />
                </ClickableButton>
              </div>
            </div>
          </div>
        </article>
      </section>
    ))
  }

  renderTabs () {
    const tabList = [
      { label: 'Oversikt', path: '/profile/loans/overview' },
      { label: 'Historikk', path: '/profile/loans/history' }
    ]
    return <Tabs push={this.props.routerActions.push}
                 tabList={tabList}
                 tabBarClass='tab-bar-secondary'
                 tabClass='tab-bar-tab-small'
                 tabActiveClass='tab-bar-tab-small-active'
                 currentPath={this.props.location.pathname} />
  }

  render () {
    if (this.props.isRequestingLoansAndReservations) {
      return <div />
    } else if (this.props.loansAndReservationError) {
      return <FormattedMessage {...messages.loansAndReservationError} />
    }
    const date = this.props.intl.formatDate(Date.now(), {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
    const time = this.props.intl.formatTime(Date.now())
    return (
      <div>
        {this.renderTabs()}

        <div className='pickup'>
          <div className='title'><FormattedMessage {...messages.canBePickedUp} /></div>
          {this.renderPickups()}
        </div>

        <div className='reserve'>
          <div className='title'><FormattedMessage {...messages.reservations} /></div>
          {this.renderReservations()}
        </div>

        <div className='registered'>
          <div className='title'><FormattedMessage {...messages.nameAndDate}
            values={{name: this.props.loansAndReservations.name, date: date, time: time}} />
            <button className='black-btn patron-placeholder'><FormattedMessage {...messages.renewAllLoans} /></button>
          </div>
          {this.renderLoans()}
        </div>
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

const messages = defineMessages({
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
  nameAndDate: {
    id: 'UserLoans.nameAndDate',
    description: 'The header over the current loans',
    defaultMessage: 'Loan registered on {name} - {date} - {time}'
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
