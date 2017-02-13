import React, { PropTypes } from 'react'

class DatepickerButton extends React.Component {
  render () {
    return (
      <button
        className="date-picker-button"
        onClick={this.props.onClick}>
        <i className="icon-calendar" aria-hidden="true" />
      </button>
    )
  }
}

DatepickerButton.propTypes = {
  onClick: PropTypes.func
}

export default DatepickerButton
