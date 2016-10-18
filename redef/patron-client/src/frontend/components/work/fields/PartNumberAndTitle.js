import React, { PropTypes } from 'react'
const PartNumberAndTitle = ({ partNumber, partTitle }) => (
  <h1>
    <span data-automation-id="work_partNumber">
      {partNumber ? `${partNumber}. ` : null}
    </span>
    <span data-automation-id="work_partTitle">
      {partTitle}
    </span>
  </h1>
)

PartNumberAndTitle.propTypes = {
  partNumber: PropTypes.string,
  partTitle: PropTypes.string
}

export default PartNumberAndTitle
