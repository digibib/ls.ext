import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import MetaItem from '../../../MetaItem'

const AgeLimit = ({ ageLimit }) => {
  if (ageLimit) {
    return (
      <MetaItem label={messages.ageLimit} data-automation-id="publication_ageLimit">{ageLimit === '0' ? <FormattedMessage {...messages.noAgeLimit} /> : ageLimit}</MetaItem>
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
  },
  noAgeLimit: {
    id: 'AgeLimit.noAgeLimit',
    description: 'Label for no age limit',
    defaultMessage: 'For all ages'
  }
})

export default AgeLimit
