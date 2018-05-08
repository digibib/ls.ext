import PropTypes from 'prop-types'
import React from 'react'

const Summary = ({ summary }) => {
  if (summary) {
    return (
      <p className="work-excerpt" data-automation-id="work_summary">{summary}</p>
    )
  } else {
    return null
  }
}

Summary.propTypes = {
  summary: PropTypes.string
}

export default Summary
