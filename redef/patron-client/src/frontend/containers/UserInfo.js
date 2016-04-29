import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import MyPageActions from '../actions/MyPageActions'
import EditableField from '../components/EditableField'

const UserInfo = React.createClass({
  propTypes: {
    dispatch: PropTypes.func.isRequired,
    myPageActions: PropTypes.object.isRequired
  },
  handleSaveClick(event) {
    console.log(event)
    console.log(this)
  },
  render () {
    const editable = true
    return (
      <div><p>UserInfo</p>
        <p><FormattedMessage {...messages.borrowerNumber} />: <span
          data-automation-id='borrowernumber'>{this.props.borrowerNumber}</span></p>
        <div>
          <div>
            <FormattedMessage {...messages.address} /><br /><EditableField editable={editable} value={this.props.personalInformation.address} />
          </div>
          <div>
            <FormattedMessage {...messages.zipcode} /><br /><EditableField editable={editable} value={this.props.personalInformation.zipcode} /><br />
            <FormattedMessage {...messages.city} /><br /><EditableField editable={editable} value={this.props.personalInformation.city} />
          </div>
          <div>
            <FormattedMessage {...messages.country} /><br /><EditableField editable={editable} value={this.props.personalInformation.country} />
          </div>
          <div>
            <FormattedMessage {...messages.mobile} /><br /><EditableField editable={editable} value={this.props.personalInformation.mobile} />
          </div>
          <div>
            <FormattedMessage {...messages.telephone} /><br /><EditableField editable={editable} value={this.props.personalInformation.telephone} />
          </div>
          <div>
            <FormattedMessage {...messages.email} /><br /><EditableField editable={editable} value={this.props.personalInformation.email} />
          </div>
        </div>

        <div>
          <EditableField ref={e => this.editableField = e.inputField} />
          <button onClick={this.handleSaveClick}><FormattedMessage {...messages.saveChanges} /></button>
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
  }
})

function mapStateToProps (state) {
  return {
    personalInformation: state.profile.personalInformation,
    borrowerNumber: state.application.borrowerNumber
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    myPageActions: bindActionCreators(MyPageActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserInfo))
