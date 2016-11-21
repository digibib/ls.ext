import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const AgeLimit = ({ ageLimit }) => {
  if (ageLimit) {
    return (
      <MetaItem label={messages.ageLimit} data-automation-id="publication_ageLimit">{ageLimit}</MetaItem>
    )
  } else {
    return null
  }
}

AgeLimit.propTypes = {
  ageLimit: PropTypes.string
}

export const messages = defineMessages({
  ageLimit: {
    id: 'AgeLimit.ageLimit',
    description: 'Label for age limit meta',
    defaultMessage: 'Age limit'
  }
})

export default AgeLimit
