import PropTypes from 'prop-types'
import React from 'react'

class DatepickerButton extends React.Component {
  render () {
    return (
      <button
        className="date-picker-button"
        onClick={this.props.onClick}>
        <img className="icon" src="/images/calendar.svg" aria-hidden="true" />
      </button>
    )
  }
}

DatepickerButton.propTypes = {
  onClick: PropTypes.func
}

export default DatepickerButton
