import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const Year = ({ year }) => {
  if (year) {
    return (
      <MetaItem label={messages.labelOriginalReleaseDate} data-automation-id="work_originalReleaseDate">
        {year}
      </MetaItem>
    )
  } else {
    return null
  }
}

Year.propTypes = {
  year: PropTypes.string
}

export const messages = defineMessages({
  labelOriginalReleaseDate: {
    id: 'Year.labelOriginalReleaseDate',
    description: 'Label for original release date',
    defaultMessage: 'Original release date'
  }
})

export default Year
