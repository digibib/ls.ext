import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import * as ParameterActions from '../actions/ParameterActions'
import * as ProfileActions from '../actions/ProfileActions'
import * as LoginActions from '../actions/LoginActions'
import EditableField from '../components/EditableField'

const UserInfo = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    profileActions: PropTypes.object.isRequired,
    personalInformation: PropTypes.object.isRequired,
    parameterActions: PropTypes.object.isRequired,
    isRequestingPersonalInformation: PropTypes.bool.isRequired,
    loginActions: PropTypes.object.isRequired,
    personalInformationError: PropTypes.object
  },
  handleSaveClick (event) {
    event.preventDefault()
    const profileInfo = {
      address: this.addressField.getValue(),
      zipcode: this.zipcodeField.getValue(),
      city: this.cityField.getValue(),
      country: this.countryField.getValue(),
      mobile: this.mobileField.getValue(),
      telephone: this.telephoneField.getValue(),
      email: this.emailField.getValue()
    }
    this.props.loginActions.requireLoginBeforeAction(
      ProfileActions.postProfileInfo(profileInfo, ParameterActions.toggleParameter('/profile/info', 'edit'))
    )
  },
  handleChangeClick (event) {
    event.preventDefault()
    this.props.loginActions.requireLoginBeforeAction(ParameterActions.toggleParameter('/profile/info', 'edit'))
  },
  render () {
    if (this.props.isRequestingPersonalInformation) {
      return <div />
    } else if (this.props.personalInformationError) {
      return <FormattedMessage {...messages.personalInformationError} />
    }
    const editable = this.props.location.query.edit === null
    return (
      <div><h2>{this.props.personalInformation.name}</h2>
        <p><FormattedMessage {...messages.borrowerNumber} />< br /><span
          data-automation-id='borrowernumber'>{this.props.personalInformation.borrowerNumber}</span></p>
        <hr />
        <div style={{display: 'inline-block', width: '33%'}}>
          <div>
            <FormattedMessage {...messages.address} /><br />
            <EditableField editable={editable}
                           value={this.props.personalInformation.address}
                           ref={e => this.addressField = e} />
          </div>
          <div>
            <FormattedMessage {...messages.zipcode} /><br />
            <EditableField editable={editable}
                           value={this.props.personalInformation.zipcode}
                           ref={e => this.zipcodeField = e} />
          </div>
          <div>
            <FormattedMessage {...messages.city} /><br />
            <EditableField editable={editable}
                           value={this.props.personalInformation.city}
                           ref={e => this.cityField = e} />
          </div>
          <div>
            <FormattedMessage {...messages.country} /><br />
            <EditableField editable={editable}
                           value={this.props.personalInformation.country}
                           ref={e => this.countryField = e} />
          </div>
          <div>
            <FormattedMessage {...messages.mobile} /><br />
            <EditableField editable={editable}
                           value={this.props.personalInformation.mobile}
                           ref={e => this.mobileField = e} />
          </div>
          <div>
            <FormattedMessage {...messages.telephone} /><br />
            <EditableField editable={editable}
                           value={this.props.personalInformation.telephone}
                           ref={e => this.telephoneField = e} />
          </div>
          <div>
            <FormattedMessage {...messages.email} /><br />
            <EditableField editable={editable}
                           value={this.props.personalInformation.email}
                           ref={e => this.emailField = e} />
          </div>
        </div>

        <div style={{display: 'inline-block', width: '33%'}}>
          <div>
            <FormattedMessage {...messages.birthdate} /><br />
            <span>{this.props.personalInformation.birthdate}</span>
          </div>
          <div>
            <FormattedMessage {...messages.loanerCardIssued} /><br />
            <span>{this.props.personalInformation.loanerCardIssued}</span>
          </div>
          <div>
            <FormattedMessage {...messages.loanerCategory} /><br />
            <span>{this.props.personalInformation.loanerCategory}</span>
          </div>
        </div>

        <div style={{display: 'inline-block', width: '33%'}}>
          <div>
            {editable
              ? <button onClick={this.handleSaveClick}><FormattedMessage {...messages.saveChanges} /></button>
              : <button onClick={this.handleChangeClick}><FormattedMessage {...messages.editPersonalInfo} /></button>}
          </div>
          <div>
            <FormattedMessage {...messages.lastUpdated} /><br />
            <span>{this.props.personalInformation.lastUpdated}</span>
          </div>
        </div>
      </div>
    )
  }
})

const messages = defineMessages({
  address: {
    id: 'UserInfo.address',
    description: 'The label for the address',
    defaultMessage: 'Address'
  },
  zipcode: {
    id: 'UserInfo.zipcode',
    description: 'The label for the zip code',
    defaultMessage: 'Zip code'
  },
  city: {
    id: 'UserInfo.city',
    description: 'The label for the city',
    defaultMessage: 'City'
  },
  country: {
    id: 'UserInfo.country',
    description: 'The label for the country',
    defaultMessage: 'Country'
  },
  mobile: {
    id: 'UserInfo.mobile',
    description: 'The label for the mobile',
    defaultMessage: 'Mobile'
  },
  telephone: {
    id: 'UserInfo.telephone',
    description: 'The label for the telephone',
    defaultMessage: 'Telephone'
  },
  email: {
    id: 'UserInfo.email',
    description: 'The label for the email',
    defaultMessage: 'Email'
  },
  birthdate: {
    id: 'UserInfo.birthdate',
    description: 'The label for the birth date',
    defaultMessage: 'Birth date'
  },
  loanerCardIssued: {
    id: 'UserInfo.loanerCardIssued',
    description: 'The label for when the loaner card was issued',
    defaultMessage: 'Loaner card issue date'
  },
  loanerCategory: {
    id: 'UserInfo.loanerCategory',
    description: 'The label for the loaner category',
    defaultMessage: 'Loaner category'
  },
  editPersonalInfo: {
    id: 'UserInfo.editPersonalInfo',
    description: 'The label for the edit personal information button',
    defaultMessage: 'Edit personal information'
  },
  saveChanges: {
    id: 'UserInfo.saveChanges',
    description: 'The label for the save changes button',
    defaultMessage: 'Save changes'
  },
  lastUpdated: {
    id: 'UserInfo.lastUpdated',
    description: 'The label for the last updated field',
    defaultMessage: 'Last updated'
  },
  borrowerNumber: {
    id: 'UserInfo.borrowerNumber',
    description: 'The label for borrower number',
    defaultMessage: 'Borrower number'
  },
  personalInformationError: {
    id: 'UserInfo.personalInformationError',
    description: 'The text shown when retrieving personal information has failed.',
    defaultMessage: 'Something went wrong when retrieving personal information.'
  }
})

function mapStateToProps (state) {
  return {
    personalInformationError: state.profile.personalInformationError,
    isRequestingPersonalInformation: state.profile.isRequestingPersonalInformation,
    personalInformation: state.profile.personalInformation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch),
    parameterActions: bindActionCreators(ParameterActions, dispatch),
    loginActions: bindActionCreators(LoginActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserInfo))
