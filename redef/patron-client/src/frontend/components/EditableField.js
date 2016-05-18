import React, { PropTypes } from 'react'

class EditableField extends React.Component {
  render () {
    return this.props.editable
      ? <input type={this.props.type} {...this.props.inputProps} />
      : <span>{this.props.inputProps.initialValue}</span>
  }
}

EditableField.propTypes = {
  editable: PropTypes.bool.isRequired,
  type: PropTypes.string.isRequired,
  inputProps: PropTypes.object.isRequired
}

EditableField.defaultProps = { type: 'text' }

export default EditableField
