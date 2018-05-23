import PropTypes from 'prop-types'
import React from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import * as RegistrationActions from '../../actions/RegistrationActions'

const formName = 'registrationPartFour'

class RegistrationFormPartFour extends React.Component {

  constructor (props) {
    super(props)
    this.handleComplete = this.handleComplete.bind(this)
  }

  handleComplete () {
    this.props.registrationActions.postRegistration()
  }

  render () {
    const { handleSubmit } = this.props
    return (
        <div className="default-form" onSubmit={handleSubmit(this.handleComplete)}>
          <form>
            <div style={{ textAlign: 'center', padding: '1em' }}>
            <h1><FormattedMessage {...messages.thanks} /></h1>
              <button className="blue-btn" type="submit">
                <FormattedMessage {...messages.submit} />
              </button>
            </div>
          </form>
        </div>
    )
  }
}

export const messages = defineMessages({
  submit: {
    id: 'RegistrationFormPartFour.submit',
    description: 'The submit button text',
    defaultMessage: 'Complete registration'
  },
  thanks: {
    id: 'RegistrationFormPartFour.thanks',
    description: 'Thank you text',
    defaultMessage: 'Thanks! We now have all the information we need.'
  }
})

RegistrationFormPartFour.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  fields: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  registrationActions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    fields: state.form.registrationPartFour ? state.form.registrationPartFour : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    registrationActions: bindActionCreators(RegistrationActions, dispatch)
  }
}

const intlRegistrationFormPartFour = injectIntl(RegistrationFormPartFour)
export { intlRegistrationFormPartFour as RegistrationFormPartFour }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({
  form: formName,
  destroyOnUnmount: false
})(intlRegistrationFormPartFour))
