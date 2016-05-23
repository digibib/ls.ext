import React, { PropTypes } from 'react'

class EditableField extends React.Component {
  render () {
    return this.props.editable
      ? <input data-automation-id={this.props['data-automation-id']} type={this.props.type} {...this.props.inputProps} />
      : <span data-automation-id={this.props['data-automation-id']}>{this.props.inputProps.initialValue}</span>
  }
}

EditableField.propTypes = {
  editable: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  inputProps: PropTypes.object.isRequired,
  'data-automation-id': PropTypes.string
}

EditableField.defaultProps = { type: 'text' }

export default EditableField
