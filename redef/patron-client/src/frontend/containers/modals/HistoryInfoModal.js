import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'
import {Link} from 'react-router'
import OptInHistoryInfo from '../../components/OptInHistoryInfo'
import * as ModalActions from '../../actions/ModalActions'
import * as ProfileActions from '../../actions/ProfileActions'
import * as HistoryActions from '../../actions/HistoryActions'

class HistoryInfoModal extends React.Component {
  constructor (props) {
    super(props)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleKeepHistory = this.handleKeepHistory.bind(this)
  }

  componentDidMount () {
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 27) {
        this.handleCancel(e)
      }
    })
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.profileActions.notNow()
    this.props.profileActions.manageHistoryConsent(false, false, 'popup')
    this.props.modalActions.hideModal()
  }

  handleKeepHistory (event) {
    event.preventDefault()
    this.props.profileActions.manageHistory(0, this.props.personalAttributes.hist_cons, 'popup')
    this.props.modalActions.hideModal()
  }

  render () {
    return (
      <div data-automation-id="history_info_modal" className="default-modal">
        <OptInHistoryInfo hasHistory={this.props.personalInformation.privacy === 0} />
        <div style={{ textAlign: 'center', padding: '1em' }}>
          <button className="blue-btn" onClick={this.handleKeepHistory} data-automation-id="delete_button">
            <FormattedMessage {...messages.keep} />
          </button>
          <Link role="button" onClick={this.handleCancel} data-automation-id="cancel_button">
            <FormattedMessage {...messages.notNow} />
          </Link>
        </div>
      </div>
    )
  }
}

HistoryInfoModal.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  isRequestingReservation: PropTypes.bool.isRequired,
  personalInformation: PropTypes.object.isRequired,
  personalAttributes: PropTypes.object.isRequired,
  modalActions: PropTypes.object.isRequired,
  profileActions: PropTypes.object.isRequired,
  historyActions: PropTypes.object.isRequired
}

export const messages = defineMessages({
  keep: {
    id: 'History.keep',
    description: 'The keep history button text',
    defaultMessage: 'Keep my history'
  },
  notNow: {
    id: 'History.notNow',
    description: 'The cancel button text',
    defaultMessage: 'Not now'
  }
})

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingReservation: state.reservation.isRequestingReservation,
    personalAttributes: state.profile.personalAttributes,
    personalInformation: state.profile.personalInformation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    modalActions: bindActionCreators(ModalActions, dispatch),
    profileActions: bindActionCreators(ProfileActions, dispatch),
    historyActions: bindActionCreators(HistoryActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(HistoryInfoModal)
