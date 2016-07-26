import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import * as ParameterActions from '../actions/ParameterActions'
import * as ProfileActions from '../actions/ProfileActions'
import * as LoginActions from '../actions/LoginActions'
import UserInfoForm from './forms/UserInfoForm'

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
      <section className="user-details">
        <UserInfoForm />

        {this.renderButtonAndLastUpdated(editable, [ 'hidden-desktop' ])}

        {this.renderStaticInfo()}
      </section>
    )
  }

  renderInfo (editable) {
    const { personalInformation } = this.props
    return (
      <section className="user-details">
        <div className="address col">

          <h2><FormattedMessage {...messages.address} /></h2>
          <address typeof="schema:PostalAddress">
            <span data-automation-id="UserInfo_address"
                  property="schema:streetAddress">{personalInformation.address}</span><br />
            <span data-automation-id="UserInfo_zipcode"
                  property="schema:postalCode">{personalInformation.zipcode}</span>
            <span data-automation-id="UserInfo_city" property="schema:addressLocality">{personalInformation.city}</span><br />
            <span data-automation-id="UserInfo_country"
                  property="schema:addressCountry">{personalInformation.country}</span><br />
          </address>

          <div className="cell-phone">
            <h2><FormattedMessage {...messages.mobile} /></h2>
            <p data-automation-id="UserInfo_mobile">{personalInformation.mobile}</p>
          </div>

          <div className="email">
            <h2><FormattedMessage {...messages.email} /></h2>
            <p data-automation-id="UserInfo_email">{personalInformation.email}</p>
          </div>
        </div>

        {this.renderButtonAndLastUpdated(editable, [ 'hidden-desktop' ])}

        {this.renderStaticInfo()}
      </section>
    )
  }

  renderButtonAndLastUpdated (editable, classNames) {
    return (
      <footer className={classNames.join(' ')}>
        <div className="change-information">
          {editable
            ? <button className="black-btn" type="button" onClick={this.handleSubmit}>
            <FormattedMessage {...messages.saveChanges} /></button>
            : <button className="black-btn" type="button" onClick={this.handleChangeClick}>
            <FormattedMessage {...messages.editPersonalInfo} /></button>}
        </div>

        <div className="last-updated">
          <FormattedMessage {...messages.lastUpdated} />:&nbsp;
            <span data-automation-id="UserInfo_lastUpdated"
                  className="green-text">{this.props.personalInformation.lastUpdated}</span>
        </div>
      </footer>
    )
  }

  render () {
    if (this.props.isRequestingPersonalInformation) {
      return <div />
    } else if (this.props.personalInformationError) {
      return <FormattedMessage {...messages.personalInformationError} />
    }
    const editable = this.props.location.query.edit === null
    const { personalInformation } = this.props

    return (
      <div>
        <header>
          <h1 data-automation-id="UserInfo_name">{personalInformation.name}</h1>

          <div className="borrow-number"><FormattedMessage {...messages.borrowerNumber} />: <span
            data-automation-id="UserInfo_borrowerNumber">{personalInformation.borrowerNumber}</span></div>
        </header>

        {editable ? this.renderEditInfo(editable) : this.renderInfo(editable)}

        {this.renderButtonAndLastUpdated(editable, [ 'hidden-mobile', 'hidden-tablet' ])}

      </div>
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
  personalInformationError: PropTypes.object,
  intl: intlShape.isRequired
}

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
    initialValues: state.profile.personalInformation
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
