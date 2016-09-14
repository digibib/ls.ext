import React, { PropTypes } from 'react'
import { reduxForm, reset, Field } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import domOnlyProps from '../../utils/domOnlyProps'

import * as ProfileActions from '../../actions/ProfileActions'

class ChangeHistorySettingForm extends React.Component {
  constructor (props) {
    super(props)
    this.handleChangeHistorySetting = this.handleChangeHistorySetting.bind(this)
  }

  renderError () {
    const { changeHistorySettingError } = this.props
    if (changeHistorySettingError) {
      return messages[ changeHistorySettingError.message ]
        ? <div style={{ color: 'red' }}><FormattedMessage {...messages[ changeHistorySettingError.message ]} /></div>
        : <div style={{ color: 'red' }}><FormattedMessage {...messages.genericChangePasswordError} /></div>
    }
  }

  handleChangeHistorySetting () {
    this.props.profileActions.changeHistorySettingFromForm(this.props.profileActions.fetchHistorySetting)
  }

  render () {
    const { submitting, handleSubmit, changeHistorySettingSuccess } = this.props
    return (
      <div className="change-history-setting-container">
        <form onSubmit={handleSubmit(this.handleChangeHistorySetting)}>

          <header>
            <h1><FormattedMessage {...messages.changeHistorySetting} /></h1>
          </header>

          <section className="change-history-setting">
            <div className="change-history-setting-fields">
              <Field name="history" component="input" type="radio" value="true" id="yesOption" />
              <label htmlFor="yesOption"><FormattedMessage {...messages.yesOption} /></label><br />
              <Field name="history" component="input" type="radio" value="false" id="noOption" />
              <label htmlFor="noOption"><FormattedMessage {...messages.noOption} /></label><br />
            </div>
          </section>
          <footer>
            <button className="black-btn" type="submit" disabled={submitting}>
              <FormattedMessage {...messages.save} /><br /></button>
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
  },
  save: {
    id: 'ChangeHistorySettingForm.save',
    description: 'The label of the save button',
    defaultMessage: 'Save'
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
    isRequestingHistorySetting: state.profile.isRequestingHistorySetting,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({ form: 'changeHistorySetting' })(intlChangeHistorySettingForm))
