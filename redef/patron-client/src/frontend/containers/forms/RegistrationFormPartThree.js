import PropTypes from 'prop-types'
import React from 'react'
import { reduxForm } from 'redux-form'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import OptInHistoryInfo from '../../components/OptInHistoryInfo'
import { Link } from 'react-router'
import * as RegistrationActions from '../../actions/RegistrationActions'

const formName = 'registrationPartThree'

class RegistrationFormPartThree extends React.Component {
  constructor (props) {
    super(props)
    this.handleNo = this.handleNo.bind(this)
    this.handleYes = this.handleYes.bind(this)
  }

  handleNo (event) {
    this.props.change('keepHistory', false)
    this.props.registrationActions.historySet()
    this.props.registrationActions.postRegistration()
  }

  handleYes (event) {
    this.props.change('keepHistory', true)
    this.props.registrationActions.historySet()
    this.props.registrationActions.postRegistration()
  }

  render () {
    const { handleSubmit } = this.props
    return (
        <div className="default-form">
          <form>
            <OptInHistoryInfo hasHistory={false} />
            <div style={{ textAlign: 'center', padding: '1em' }}>
              <button className="blue-btn" onClick={handleSubmit(this.handleYes)}>
                <FormattedMessage {...messages.keep} />
              </button>&nbsp; &nbsp;
              <Link role="button" onClick={handleSubmit(this.handleNo)}>
                <FormattedMessage {...messages.notNow} />
              </Link>
            </div>
          </form>
        </div>
    )
  }
}

export const messages = defineMessages({
  keep: {
    id: 'RegistrationFormPartThree.keep',
    description: 'The keep history button text',
    defaultMessage: 'Preserve my borrowing history'
  },
  notNow: {
    id: 'RegistrationFormPartThree.notNow',
    description: 'The cancel button text',
    defaultMessage: 'Not now'
  }
})

RegistrationFormPartThree.propTypes = {
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  change: PropTypes.func.isRequired,
  fields: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  registrationActions: PropTypes.object.isRequired
}

function mapStateToProps (state) {
  return {
    fields: state.form.registrationPartThree ? state.form.registrationPartThree : {}
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    registrationActions: bindActionCreators(RegistrationActions, dispatch)
  }
}

const intlRegistrationFormPartThree = injectIntl(RegistrationFormPartThree)
export { intlRegistrationFormPartThree as RegistrationFormPartThree }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({
  form: formName,
  destroyOnUnmount: false
})(intlRegistrationFormPartThree))
