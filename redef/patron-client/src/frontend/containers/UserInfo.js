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
      <div><h2 data-automation-id='UserInfo_name'>{this.props.personalInformation.name}</h2>
        <form onSubmit={this.props.handleSubmit(this.handleSubmit)}>
          <p><FormattedMessage {...messages.borrowerNumber} />< br /><span
            data-automation-id='UserInfo_borrowerNumber'>{this.props.personalInformation.borrowerNumber}</span></p>
          <hr />
          <div style={{display: 'inline-block', width: '33%'}}>
            {Object.keys(this.props.fields).map(fieldName => this.generateField(fieldName, editable))}
          </div>

          <div style={{display: 'inline-block', width: '33%'}}>
            <div>
              <FormattedMessage {...messages.birthdate} /><br />
              <span data-automation-id='UserInfo_birthdate'>{this.props.personalInformation.birthdate}</span>
            </div>
            <div>
              <FormattedMessage {...messages.loanerCardIssued} /><br />
              <span
                data-automation-id='UserInfo_loanerCardIssued'>{this.props.personalInformation.loanerCardIssued}</span>
            </div>
            <div>
              <FormattedMessage {...messages.loanerCategory} /><br />
              <span data-automation-id='UserInfo_loanerCategory'>{this.props.personalInformation.loanerCategory}</span>
            </div>
          </div>

          <div style={{display: 'inline-block', width: '33%'}}>
            <div>
              {editable
                ? <button><FormattedMessage {...messages.saveChanges} /></button>
                : <button onClick={this.handleChangeClick}><FormattedMessage {...messages.editPersonalInfo} /></button>}
            </div>
            <div>
              <FormattedMessage {...messages.lastUpdated} /><br />
              <span data-automation-id='UserInfo_lastUpdated'>{this.props.personalInformation.lastUpdated}</span>
            </div>
          </div>
        </form>
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
