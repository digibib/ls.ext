import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import DatePicker from 'react-datepicker'
import moment from 'moment'

import FormInputField from '../../components/FormInputField'
import DatepickerButton from '../../components/DatepickerButton'
import * as ReservationActions from '../../actions/ReservationActions'
import * as ModalActions from '../../actions/ModalActions'
import * as DatepickerActions from '../../actions/DatepickerActions'
import asyncValidate from '../../utils/asyncValidate'
import validator from '../../../common/validation/validator'
import fields from '../../../common/forms/postponeReservationForm'
import ValidationMessage from '../../components/ValidationMessage'

const formName = 'postponeReservation'

class PostponeReservationForm extends React.Component {
  constructor (props) {
    super(props)
    this.handlePostponeReservation = this.handlePostponeReservation.bind(this)
    this.getValidator = this.getValidator.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleDateChange = this.handleDateChange.bind(this)
  }

  handlePostponeReservation (field) {
    if (this.props.date === null || this.props.date !== field.date) {
      this.props.datepickerActions.handleDateChange(moment(field.date, 'DD.MM.YYYY'))
    }

    this.props.reservationActions.changeReservationSuspension(
      this.props.modalProps.reserveId,
      this.props.modalProps.suspended,
      this.props.date.date)
    this.props.modalActions.hideModal()
  }

  getValidator (field) {
    if (field.meta.touched && field.meta.error) {
      return <div className="feedback"><ValidationMessage message={field.meta.error} /></div>
    }
  }

  handleCancel (event) {
    event.preventDefault()
    this.props.modalActions.hideModal()
  }

  handleDateChange (date) {
    this.props.datepickerActions.handleDateChange(date)
  }

  render () {
    const {
      submitting,
      handleSubmit
    } = this.props
    return (
      <div>
        <h2>
          <FormattedMessage {...messages.postponeReservation} />
        </h2>
        <div className="postpone-reserve">
          <div className="item">
          <FormInputField name="date"
                          message={messages.activateAfter}
                          formName={formName}
                          getValidator={this.getValidator}
                          headerType=""
                          placeholder={messages.date}
                          type="text"
          />
          <DatePicker
            customInput={<DatepickerButton />}
            name="date"
            message={messages.activateAfter}
            headerType=""
            type="text"
            dateFormat="DD.MM.YYYY"
            formName={formName}
            minDate={moment()}
            locale="NB-no"
            placeholder={messages.date}
            onChange={this.handleDateChange}
            selected={this.props.date ? moment(this.props.date.date, 'DD.MM.YYYY') : null}
            />
          </div>
          <div className="postpone-aside">
            <p><FormattedMessage {...messages.postponeInfoMsg} /></p>
          </div>
        </div>
        <button
          className="black-btn"
          data-automation-id="postpone_reserve_button"
          type="button"
          disabled={submitting}
          onClick={handleSubmit(this.handlePostponeReservation)}
          >
          <FormattedMessage {...messages.okButton} />
        </button>
        <button className="grey-btn" onClick={this.handleCancel} data-automation-id="cancel_button">
          <FormattedMessage {...messages.cancel} />
        </button>
      </div>
    )
  }
}

export const messages = defineMessages({
  postponeInfoMsg: {
    id: 'UserLoans.postponeInfoMsg',
    description: 'Supplement message for postponing reservation',
    defaultMessage: 'NB: You will keep your place in queue. You can cancel postponement at any time.'
  },
  activateAfter: {
    id: 'UserLoans.activateAfter',
    description: 'Form label for datepicker field in postpone reservation',
    defaultMessage: 'Activate after'
  },
  postponeReservation: {
    id: 'UserLoans.postponeReservation',
    description: 'The header text for postponing reservation dialog',
    defaultMessage: 'Postpone reservation'
  },
  okButton: {
    id: 'UserLoans.postponeReservationOK',
    description: 'The confirm button in postpone reservation dialog',
    defaultMessage: 'OK'
  },
  cancel: {
    id: 'UserLoans.cancel',
    description: 'The cancel button text',
    defaultMessage: 'Cancel'
  },
  date: {
    id: 'UserLoans.dateFormat',
    description: 'Date placeholder for datepicker in postpone reservation dialog',
    defaultMessage: 'dd.mm.yyyy'
  }
})

PostponeReservationForm.propTypes = {
  reservationActions: PropTypes.object.isRequired,
  modalProps: PropTypes.object.isRequired,
  date: PropTypes.object,
  modalActions: PropTypes.object.isRequired,
  datepickerActions: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired
}

function mapStateToProps (state) {
  return {
    isLoggedIn: state.application.isLoggedIn,
    isRequestingReservation: state.reservation.isRequestingReservation,
    date: state.datepicker.date,
    initialValues: state.datepicker.date,
    modalProps: state.modal.modalProps
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    modalActions: bindActionCreators(ModalActions, dispatch),
    datepickerActions: bindActionCreators(DatepickerActions, dispatch)
  }
}

const intlPostponeReservationForm = injectIntl(PostponeReservationForm)
export { intlPostponeReservationForm as PostponeReservationForm }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({
  form: formName,
  // enableReinitialize: true,
  asyncValidate,
  asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
  validate: validator(fields)
})(intlPostponeReservationForm))
