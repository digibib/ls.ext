import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

import FormInputField from '../../components/FormInputField'
import * as ReservationActions from '../../actions/ReservationActions'
import * as ModalActions from '../../actions/ModalActions'

const formName = 'remoteReservationForm'

class RemoteReservationForm extends React.Component {
  constructor (props) {
    super(props)
    this.getValidator = this.getValidator.bind(this)
    this.handleRemoteReserve = this.handleRemoteReserve.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  handleRemoteReserve (field) {
    this.props.reservationActions.remoteReservePublication(
      this.props.modalProps.publication.recordId,
      field.userId,                                      // cardnumber of remote patron
      field.reservationComment
    )
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  hasInvalidFormFields () {
    return Object.values(this.props.fields).every(field => field.error)
  }

  getValidator (field) {
    if (field && field.meta.touched && field.meta.error) {
      return <div style={{ color: 'red', fontSize: '12px' }}>{this.props.intl.formatMessage(field.meta.error)}</div>
    }
  }

  getWaitingListInformation () {
    const holds = this.props.modalProps.publication.numHolds
    if (holds > 0) {
      return (
        <div style={{ color: 'red' }}>
          <FormattedMessage {...this.props.messages.waitingListPrefix} />{holds}<FormattedMessage {...this.props.messages.waitingListSuffix} />
        </div>
      )
    }
  }

  render () {
    const {
      handleSubmit,
      messages
    } = this.props
    return (

      <div data-automation-id="remote_reservation_modal">
        <button className="close-modal-button" onClick={this.props.modalActions.hideModal}>
          <span className="is-vishidden">Close</span>
          <i className="icon-cancel-1" aria-hidden="true" />
        </button>

        <form onSubmit={handleSubmit(this.handleRemoteReserve)}>
          <h1><FormattedMessage {...messages.remoteReservation} /></h1>
          <div className="remote-reservation">
            <p><strong>{this.props.modalProps.publication.mainTitle}</strong></p>
            <p>{this.getWaitingListInformation()}</p>

            <div className="remote-reservation-fields">
              <FormInputField name="userId" message={messages.userId} formName={formName}
                              getValidator={this.getValidator} />
              {/* Hide comment field, until Norwegian NCIP profile as settled how to deal with it.
              <p><FormattedMessage {...messages.reserveLimitationNote} /></p>
              <FormInputField name="reservationComment" message={messages.reservationComment} formName={formName}
                              getValidator={this.getValidator} />
              */}
            </div>
            <p>
              <strong><FormattedMessage {...messages.remoteReserveManagementInfoHeader} /></strong><br />
              <FormattedMessage {...messages.remoteReserveManagementInfo} />
            </p>
          </div>
            <button className="blue-btn" data-automation-id="remoteReservationButton"
                  disabled={this.props.isRequestingReservation}
                  onClick={this.handleReserve}>
            <FormattedMessage {...messages.reserve} />
          </button>
          <button className="grey-btn" onClick={this.handleCancel} data-automation-id="cancel_button">
            <FormattedMessage {...messages.cancel} />
          </button>
        </form>
      </div>
    )
  }
}

RemoteReservationForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  reservationActions: PropTypes.object,
  modalActions: PropTypes.object,
  modalProps: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  messages: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isRequestingReservation: PropTypes.bool.isRequired,
  intl: intlShape.isRequired
}

function mapStateToProps (state) {
  return {
    isRequestingReservation: state.reservation.isRequestingReservation,
    publicationId: state.reservation.publicationId,
    requestingLibrary: state.reservation.requestingLibrary,
    changePasswordSuccess: state.profile.changePasswordSuccess,
    initialValues: {},
    modalProps: state.modal.modalProps,
    profile: state.profile,
    fields: state.form.remoteReservationForm ? state.form.remoteReservationForm : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    modalActions: bindActionCreators(ModalActions, dispatch),
    reservationActions: bindActionCreators(ReservationActions, dispatch)
  }
}

const intlRemoteReservationForm = injectIntl(RemoteReservationForm)
export { intlRemoteReservationForm as RemoteReservationForm }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({ form: formName })(intlRemoteReservationForm))
