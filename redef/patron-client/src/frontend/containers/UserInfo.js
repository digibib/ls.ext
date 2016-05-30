import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { reduxForm } from 'redux-form'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import * as ParameterActions from '../actions/ParameterActions'
import * as ProfileActions from '../actions/ProfileActions'
import * as LoginActions from '../actions/LoginActions'
import EditableField from '../components/EditableField'

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

  generateField (fieldName, editable) {
    const field = this.props.fields[ fieldName ]
    return (
      <div key={fieldName}>
        <FormattedMessage {...messages[ fieldName ]} /><br />
        <EditableField data-automation-id={`UserInfo_${fieldName}`}
                       editable={editable}
                       inputProps={{placeholder: this.props.intl.formatMessage({...messages[fieldName]}), ...field}} />
        {field.touched && field.error && <div style={{color: 'red'}}>{this.props.intl.formatMessage(field.error)}</div>}
      </div>
    )
  }

  render () {
    if (this.props.isRequestingPersonalInformation) {
      return <div />
    } else if (this.props.personalInformationError) {
      return <FormattedMessage {...messages.personalInformationError} />
    }
    const editable = this.props.location.query.edit === null
    return (
      <div>
        <header>
          <h1 data-automation-id='UserInfo_name'>{this.props.personalInformation.name}</h1>

          <div className='borrow-number'><FormattedMessage {...messages.borrowerNumber} />: <span
            data-automation-id='UserInfo_borrowerNumber'>{this.props.personalInformation.borrowerNumber}</span></div>
        </header>

        <section className='user-details'>
          <form name='user-details'>
            <div className='address col patron-placeholder'>

              <h2>Adresse </h2>
              <address typeof='schema:PostalAddress'>
                <span property='schema:name'>Midtisvingen 78</span><br />
                <span property='schema:postalCode'>2478</span>
                <span property='schema:streetAddress'> Langtnordiskogen</span><br />
                <span property='schema:addressCountry'>Norge</span><br />
              </address>

              <div className='cell-phone'>
                <h2>Mobil</h2>
                <p>985 92 239</p>
              </div>

              <div className='email'>
                <h2>E-post</h2>
                <p>ola.finn.oddvar@nordmann.no</p>
              </div>
            </div>

            <footer className='hidden-desktop'>
              <div className='change-information'>
                {editable
                  ? <button className='black-btn' type='button'><FormattedMessage {...messages.saveChanges} /></button>
                  : <button className='black-btn' type='button' onClick={this.handleChangeClick}>
                  <FormattedMessage {...messages.editPersonalInfo} /></button>}
              </div>

              <div className='last-updated'>
                <FormattedMessage {...messages.lastUpdated} />:
                <span data-automation-id='UserInfo_lastUpdated'
                      className='green-text'> {this.props.personalInformation.lastUpdated}</span>
              </div>
            </footer>

            <div>
              <div className='col patron-placeholder'>
                <div className='birth'>
                  <h2><FormattedMessage {...messages.birthdate} /></h2>
                  <p>09/09/1981</p>
                </div>

                <div className='sex'>
                  <h2>Kjønn</h2>
                  <p>Mann</p>
                </div>

                <div className='loan-card'>
                  <h2><FormattedMessage {...messages.loanerCardIssued} /></h2>
              <span
                data-automation-id='UserInfo_loanerCardIssued'><p>{this.props.personalInformation.loanerCardIssued}</p></span>
                </div>

                <div className='category'>
                  <h2><FormattedMessage {...messages.loanerCategory} /></h2>
                  <span
                    data-automation-id='UserInfo_loanerCategory'><p>{this.props.personalInformation.loanerCategory}</p></span>
                </div>
              </div>
            </div>
          </form>
        </section>

        <footer className='hidden-mobile hidden-tablet'>
          <div className='change-information'>
            {editable
              ? <button className='black-btn' type='button'><FormattedMessage {...messages.saveChanges} /></button>
              : <button className='black-btn' type='button' onClick={this.handleChangeClick}>
              <FormattedMessage {...messages.editPersonalInfo} /></button>}
          </div>

          <div className='last-updated'>
            <FormattedMessage {...messages.lastUpdated} />:
            <span data-automation-id='UserInfo_lastUpdated'
                  className='green-text'> {this.props.personalInformation.lastUpdated}</span>
          </div>
        </footer>
        <section className='user-details'>
          <form name='change-user-details' id='change-user-details'>
            <div className='address col patron-placeholder'>

              <h2>Adresse </h2>
              <address typeof='schema:PostalAddress'>
                <span property='schema:name'><input type='text' placeholder='Gatenavn' /></span><br />
                <span property='schema:postalCode'><input type='number' placeholder='Postnummer' /></span>
                <span property='schema:streetAddress'><input type='text' placeholder='By' /></span><br />
                <span property='schema:addressCountry'><input type='text' placeholder='Land' /></span><br />
              </address>
            </div>

            <div className='col'>
              <div className='cell-phone'>
                <h2>Mobil</h2>
                <input type='number' placeholder='Mobilnummer' />
              </div>

              <div className='email'>
                <h2>E-post</h2>
                <input type='email' placeholder='E-post' />
              </div>
            </div>
          </form>
        </section>

        <footer className='hidden-mobile hidden-tablet'>
          <div className='change-information'>
            {editable
              ? <button className='black-btn' type='button'><FormattedMessage {...messages.saveChanges} /></button>
              : <button className='black-btn' type='button' onClick={this.handleChangeClick}>
              <FormattedMessage {...messages.editPersonalInfo} /></button>}
          </div>

          <div className='last-updated'>
            <FormattedMessage {...messages.lastUpdated} />:
            <span data-automation-id='UserInfo_lastUpdated'
                  className='green-text'> {this.props.personalInformation.lastUpdated}</span>
          </div>
        </footer>

      </div>
    )
  }
}

UserInfo.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  profileActions: PropTypes.object.isRequired,
  personalInformation: PropTypes.object.isRequired,
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
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

const validate = values => {
  const errors = {}
  if (!values.email) {
    errors.email = messages.required
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = messages.invalidEmail
  }
  return errors
}

export default reduxForm(
  {
    form: 'userInfo',
    fields: [ 'address', 'zipcode', 'city', 'country', 'mobile', 'telephone', 'email' ],
    validate
  },
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserInfo))
