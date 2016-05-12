import React, { PropTypes } from 'react'

export default React.createClass({
  propTypes: {
    editable: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    inputProps: PropTypes.object.isRequired
  },
  getDefaultProps () {
    return { type: 'text' }
  },
  render () {
    return this.props.editable
      ? <input type={this.props.type} {...this.props.inputProps} />
      : <span>{this.props.inputProps.initialValue}</span>
  }
})
