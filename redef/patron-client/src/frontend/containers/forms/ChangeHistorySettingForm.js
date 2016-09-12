import React, { PropTypes } from 'react'
import { reduxForm, reset } from 'redux-form'
import { bindActionCreators } from 'redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import domOnlyProps from '../../utils/domOnlyProps'

import * as ProfileActions from '../../actions/ProfileActions'

class ChangeHistorySettingForm extends React.Component {
  constructor (props) {
    super(props)
    this.handleChangeHistorySetting = this.handleChangeHistorySetting.bind(this)
  }

  renderError () {
    const { changePasswordError } = this.props
    if (changePasswordError) {
      return messages[ changePasswordError.message ]
        ? <div style={{ color: 'red' }}><FormattedMessage {...messages[ changePasswordError.message ]} /></div>
        : <div style={{ color: 'red' }}><FormattedMessage {...messages.genericChangePasswordError} /></div>
    }
  }

  handleChangeHistorySetting() {
    this.props.profileActions.changeHistorySettingFromForm(this.props.profileActions.fetchHistorySetting)
  }

  render () {
    const {
      fields: {
        history
      },
      submitting,
      handleSubmit,
      changeHistorySettingSuccess
    } = this.props
    return (
      <div className="change-history-setting-container">
        <form onSubmit={handleSubmit(this.handleChangeHistorySetting)}>

          <header>
            <h1><FormattedMessage {...messages.changeHistorySetting} /></h1>
          </header>

          <section className="change-history-setting">
            <div className="change-history-setting-fields">
              <input {...domOnlyProps(history)} type="radio" value="true" checked={history.value == 'true'} /><br />
              <input {...domOnlyProps(history)} type="radio" value="false" checked={history.value == 'false'} /><br />
            </div>
          </section>
          <footer>
            <button className="black-btn" type="submit" disabled={submitting}>
              <FormattedMessage {...messages.changeHistorySetting} /><br /></button>
            {changeHistorySettingSuccess
              ? <div style={{ color: 'green' }}><FormattedMessage {...messages.changeHistorySettingSuccess} />
            </div> : null}
          </footer>
        </form>
      </div>
    )
  }
}

const messages = defineMessages({
  changeHistorySetting: {
    id: 'ChangeHistorySettingForm.changeHistorySetting',
    description: 'The header for the change history setting field',
    defaultMessage: 'Loan history'
  },
  changeHistorySettingDescription: {
    id: 'ChangeHistorySettingForm.changeHistorySettingDescription',
    description: 'The field description',
    defaultMessage: 'We can save your loan history if you wish:'
  },
  yesOption: {
    id: 'ChangeHistorySettingForm.yesOption',
    description: 'The label of the yes option',
    defaultMessage: 'Yes! Please save my loans after return'
  },
  noOption: {
    id: 'ChangeHistorySettingForm.noOption',
    description: 'The label of the no option',
    defaultMessage: 'No, it is not necessary'
  },
  genericChangeHistorySettingError: {
    id: 'ChangeHistorySettingForm.genericChangeHistorySettingError',
    description: 'Generic error message when changing the history setting fails',
    defaultMessage: 'Something went wrong when changing the history setting'
  },
  changeHistorySettingSuccess: {
    id: 'ChangeHistorySettingForm.changeHistorySettingSuccess',
    description: 'Message changing the history setting is successful',
    defaultMessage: 'The setting was successfully changed'
  }
})

ChangeHistorySettingForm.propTypes = {
  dispatch: PropTypes.func.isRequired,
  profileActions: PropTypes.object.isRequired,
  changeHistorySettingSuccess: PropTypes.bool.isRequired,
  fields: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  changeHistorySettingError: PropTypes.object,
}

function mapStateToProps (state) {
  return {
    changeHistorySettingError: state.profile.changeHistorySettingError,
    changeHistorySettingSuccess: state.profile.changeHistorySettingSuccess,
    initialValues: { history: String(state.profile.history) }
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

const intlChangeHistorySettingForm = injectIntl(ChangeHistorySettingForm)
export { intlChangeHistorySettingForm as ChangeHistorySettingForm }

export default reduxForm(
  {
    form: 'changeHistorySetting',
    fields: [ 'history' ]
  },
  mapStateToProps,
  mapDispatchToProps
)(intlChangeHistorySettingForm)
