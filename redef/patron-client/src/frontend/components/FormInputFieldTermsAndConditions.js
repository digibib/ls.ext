import React, { PropTypes } from 'react'
import { Field } from 'redux-form'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'

class FormInputFieldTermsAndConditions extends React.Component {
  constructor (props) {
    super(props)
    this.renderTermsAndConditions = this.renderTermsAndConditions.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  handleKey (event, inputEl) {
    if (event.keyCode === 32) { // Space for checkbox
      event.preventDefault()
      inputEl.click() // redux-form would not accept onKeyDown
    }
  }

  renderTermsAndConditions (field) {
    console.log('Field', field)
    return (
      <div className="terms_and_conditions">
        <input data-automation-id="accept_terms"
               onClick={this.props.handleAcceptTerms}
               id={field.name}
               {...field.input}
               type={field.type}
               ref={input => this.inputElement = input}
        />
        <label htmlFor={field.name} onKeyDown={(e) => { this.handleKey(e, this.inputElement) }}>
          <span className="checkbox-wrapper">
            <i className="icon-check-empty checkbox-unchecked" role="checkbox" aria-checked="false" tabIndex="0" />
            <i className="icon-ok-squared checkbox-checked" role="checkbox" aria-checked="true" tabIndex="0" />
          </span>
          <span className="checkbox-desc">
            <FormattedMessage {...this.props.message} />
          </span>
        </label>
        {this.props.getValidator(field)}
      </div>
    )
  }

  render () {
    return <Field name={this.props.name} type={this.props.type} component={this.renderTermsAndConditions} />
  }
}

FormInputFieldTermsAndConditions.propTypes = {
  formName: PropTypes.string.isRequired,
  handleAcceptTerms: PropTypes.func.isRequired,
  message: PropTypes.object.isRequired,
  getValidator: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired
}

export default injectIntl(FormInputFieldTermsAndConditions)
