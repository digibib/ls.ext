import React, { PropTypes } from 'react'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import * as ParameterActions from '../actions/ParameterActions'
import * as ProfileActions from '../actions/ProfileActions'
import * as LoginActions from '../actions/LoginActions'
import UserInfoForm from './forms/UserInfoForm'
import Constants from '../constants/Constants'

class UserInfo extends React.Component {
  constructor (props) {
    super(props)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChangeClick = this.handleChangeClick.bind(this)
  }

  handleSubmit () {
    this.props.loginActions.requireLoginBeforeAction(
      ProfileActions.postProfileInfo(ParameterActions.toggleParameter('edit'))
    )
  }

  handleChangeClick (event) {
    event.preventDefault()
    this.props.loginActions.requireLoginBeforeAction(ParameterActions.toggleParameter('edit'))
  }

  renderStaticInfo () {
    const { personalInformation } = this.props
    return (
      <div>
        <div className="col patron-placeholder">
          <div className="birth">
            <h2><FormattedMessage {...messages.birthdate} /></h2>
            <p data-automation-id="UserInfo_birthdate">{personalInformation.birthdate}</p>
          </div>

          <div className="sex patron-placeholder">
            <h2>Kjønn</h2>
            <p>Mann</p>
          </div>

          <div className="loan-card">
            <h2><FormattedMessage {...messages.loanerCardIssued} /></h2>
            <p data-automation-id="UserInfo_loanerCardIssued">{this.props.personalInformation.loanerCardIssued}</p>
          </div>

          <div className="category">
            <h2><FormattedMessage {...messages.loanerCategory} /></h2>
            <p data-automation-id="UserInfo_loanerCategory">{this.props.personalInformation.loanerCategory}</p>
          </div>
        </div>
      </div>
    )
  }

  renderEditInfo (editable) {
    return (
      <section className="user-info-form">
        <UserInfoForm />
        {this.renderStaticInfo()}
      </section>
    )
  }

  renderInfo (editable) {
    const { personalInformation } = this.props
    return (
      <div>
        <div className="meta-item">
          <div className="meta-label"><FormattedMessage {...messages.address} /></div>
          <div className="meta-content">
            <address typeof="schema:PostalAddress">
              <span data-automation-id="UserInfo_address" property="schema:streetAddress" className="address-street">
                {personalInformation.address}
              </span><br />
              <span data-automation-id="UserInfo_zipcode" property="schema:postalCode" className="address-zip">
                {personalInformation.zipcode}
              </span>&nbsp;
              <span data-automation-id="UserInfo_city" property="schema:addressLocality" className="address-city">
                {personalInformation.city}
              </span><br />
              <span data-automation-id="UserInfo_country" property="schema:addressCountry" className="address-country">
                {personalInformation.country}
              </span>
            </address>
          </div>
        </div>
        <div className="meta-item">
          <div className="meta-label"><FormattedMessage {...messages.mobile} /></div>
          <div className="meta-content" data-automation-id="UserInfo_mobile">
            {personalInformation.mobile}
          </div>
        </div>
        <div className="meta-item">
          <div className="meta-label"><FormattedMessage {...messages.email} /></div>
          <div className="meta-content" data-automation-id="UserInfo_email">
            {personalInformation.email}
          </div>
        </div>
        {this.renderStaticInfo()}
      </div>
    )
  }

  renderButtonAndLastUpdated (editable, classNames) {
    return (
      <footer className={classNames.join(' ')}>
        {editable
          ? <button className="black-btn" type="button" onClick={this.handleSubmit} data-automation-id="save_profile_changes_button">
          <FormattedMessage {...messages.saveChanges} /></button>
          : <button className="black-btn" type="button" onClick={this.handleChangeClick} data-automation-id="change_profile_info_button">
          <FormattedMessage {...messages.editPersonalInfo} /></button>}
        {/* <div className="last-updated">
          <FormattedMessage {...messages.lastUpdated} />:&nbsp;
          <span data-automation-id="UserInfo_lastUpdated" className="green-text">
              {formatDate(this.props.personalInformation.lastUpdated)}
            </span>
        </div> */}
      </footer>
    )
  }

  render () {
    if (this.props.isRequestingPersonalInformation) {
      return <div />
    } else if (this.props.personalInformationError) {
      return <FormattedMessage {...messages.personalInformationError} />
    }
    const editable = this.props.location.query.edit === Constants.enabledParameter
    const { personalInformation, borrowerName } = this.props

    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="user-info">
        <header>
          <h1 data-automation-id="UserInfo_name">{borrowerName}</h1>
          <div className="card-number"><FormattedMessage {...messages.cardNumber} />: <span
            data-automation-id="UserInfo_cardNumber">{personalInformation.cardNumber}</span></div>
        </header>
        {editable ? this.renderEditInfo(editable) : this.renderInfo(editable)}
        {this.renderButtonAndLastUpdated(editable, [ '' ])}
      </NonIETransitionGroup>
    )
  }
}

UserInfo.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  profileActions: PropTypes.object.isRequired,
  personalInformation: PropTypes.object.isRequired,
  parameterActions: PropTypes.object.isRequired,
  isRequestingPersonalInformation: PropTypes.bool.isRequired,
  loginActions: PropTypes.object.isRequired,
  borrowerName: PropTypes.string.isRequired,
  personalInformationError: PropTypes.object,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
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
  cardNumber: {
    id: 'UserInfo.cardNumber',
    description: 'The label for card number',
    defaultMessage: 'Borrower card number'
  },
  personalInformationError: {
    id: 'UserInfo.personalInformationError',
    description: 'The text shown when retrieving personal information has failed.',
    defaultMessage: 'Something went wrong when retrieving personal information.'
  },
  required: {
    id: 'UserInfo.required',
    description: 'Displayed below a field when not filled out',
    defaultMessage: 'Required'
  },
  invalidEmail: {
    id: 'UserInfo.invalidEmail',
    description: 'Displayed when the email is not valid',
    defaultMessage: 'Invalid email address'
  }
})

function mapStateToProps (state) {
  return {
    personalInformationError: state.profile.personalInformationError,
    isRequestingPersonalInformation: state.profile.isRequestingPersonalInformation,
    personalInformation: state.profile.personalInformation,
    initialValues: state.profile.personalInformation,
    borrowerName: state.profile.borrowerName
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
