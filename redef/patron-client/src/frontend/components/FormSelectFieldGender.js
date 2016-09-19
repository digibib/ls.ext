import React, {PropTypes, createElement} from 'react'
import { injectIntl, intlShape, FormattedMessage } from 'react-intl'
import { Field } from 'redux-form'

class FormSelectFieldGender extends React.Component {
  render () {
    const formattedHeaderMsg = <FormattedMessage {...this.props.message} />
    const header = createElement(this.props.headerTag, {}, formattedHeaderMsg)
    return (
      <div className="form-item">
        {header}
        <div className="select-container">
          <Field name={this.props.name} component="select" data-automation-id="gender_selection">
            {this.props.options.map(option => <option key={option}
                                                      value={option}>{this.props.intl.formatMessage({ ...this.props.optionMessages[ option ] })}</option>)}
          </Field>
        </div>
      </div>
    )
  }
}

FormSelectFieldGender.propTypes = {
  message: PropTypes.object.isRequired,
  headerTag: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  optionMessages: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  name: PropTypes.string.isRequired
}

export default injectIntl(FormSelectFieldGender)
