import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Duration = ({ duration }) => {
  if (duration) {
    return (
      <MetaItem label={messages.duration} data-automation-id="publication_duration">{duration}</MetaItem>
    )
  } else {
    return null
  }
}

Duration.propTypes = {
  duration: PropTypes.string
}

export const messages = defineMessages({
  duration: {
    id: 'Duration.duration',
    description: 'Label for duration meta',
    defaultMessage: 'Duration'
  }
})

export default Duration
