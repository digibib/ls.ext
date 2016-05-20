import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage, intlShape } from 'react-intl'
import { routerActions } from 'react-router-redux'

import Branches from '../constants/Branches'
import * as ProfileActions from '../actions/ProfileActions'
import Tabs from '../components/Tabs'

class UserLoans extends React.Component {
  renderPickups () {
    return this.props.loansAndReservations.pickup.map(item => (
      <section key={item.recordId} className='single-entry' style={{backgroundColor: '#eee'}}>
        <aside className='book-cover'><a className='book-cover-item' href=''></a>
        </aside>
        <article className='entry-content'>
          <h1>{item.title}</h1>
          <div>
            <div style={{width: '80%', display: 'inline-block'}}>
              <p><FormattedMessage {...messages.author} />: <strong>{item.author}</strong></p>
              <p><FormattedMessage {...messages.publicationYear} />: {item.publicationYear}</p>
            </div>
            <div style={{width: '20%', display: 'inline-block'}}>
              <div>
                <FormattedMessage {...messages.expiry} /><br />
                <span>{item.expiry}</span>
              </div>
              <div>
                <FormattedMessage {...messages.pickupNumber} /><br />
                <span>{item.pickupNumber}</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    ))
  }

  renderReservations () {
    return (
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
          <tr key={item.recordId}>
            <td>{item.title}</td>
            <td>{item.author}</td>
            <td>{item.orderedDate}</td>
            <td>{item.waitingPeriod}</td>
            <td>{Branches[ item.branchCode ]}</td>
            <td>
              <button><FormattedMessage {...messages.cancelReservation} /></button>
            </td>
          </tr>
        ))}</tbody>
      </table>
    )
  }

  renderLoans () {
    return this.props.loansAndReservations.loans.map(item => (
      <section key={item.recordId} className='single-entry' style={{backgroundColor: '#eee'}}>
        <aside className='book-cover'><a className='book-cover-item' href=''></a>
        </aside>
        <article className='entry-content'>
          <h1>{item.title}</h1>
          <div>
            <div style={{width: '80%', display: 'inline-block'}}>
              <p><FormattedMessage {...messages.author} />: <strong>{item.author}</strong></p>
              <p><FormattedMessage {...messages.publicationYear} />: {item.publicationYear}</p>
            </div>
            <div style={{width: '20%', display: 'inline-block'}}>
              <div>
                <FormattedMessage {...messages.dueDate} /><br />
                <span>{item.dueDate}</span>
              </div>
              <div>
                <button><FormattedMessage {...messages.extendLoan} /></button>
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
                 currentPath={this.props.currentPath} />
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
        <hr />
        <div>
          <h3><FormattedMessage {...messages.canBePickedUp} /></h3>
          {this.renderPickups()}
        </div>
        <hr />
        <div>
          <h3><FormattedMessage {...messages.reservations} /></h3>
          {this.renderReservations()}
        </div>
        <hr />
        <div>
          <h3><FormattedMessage {...messages.nameAndDate}
            values={{name: this.props.loansAndReservations.name, date: date, time: time}} /></h3>
          <button><FormattedMessage {...messages.renewAllLoans} /></button>
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
  currentPath: PropTypes.string.isRequired,
  isRequestingLoansAndReservations: PropTypes.bool.isRequired,
  loansAndReservationError: PropTypes.object,
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
  cancelReservation: {
    id: 'UserLoans.cancelReservation',
    description: 'The label on the button to cancel a reservation',
    defaultMessage: 'Cancel reservation'
  },
  extendLoan: {
    id: 'UserLoans.extendLoan',
    description: 'The label on the button to extend a loan',
    defaultMessage: 'Extend loan'
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
    currentPath: state.routing.locationBeforeTransitions.pathname
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch),
    routerActions: bindActionCreators(routerActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserLoans))
