import React, { PropTypes } from 'react'

export default React.createClass({
  propTypes: {
    editable: PropTypes.bool.isRequired,
    value: PropTypes.string.isRequired
  },
  getValue () {
    return this.inputField ? this.inputField.value : this.props.value
  },
  render () {
    return this.props.editable
      ? <input type='text' ref={e => this.inputField = e} defaultValue={this.props.value} />
      : <span>{this.props.value}</span>
  }
})
