import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const SerialIssues = ({ serialIssues }) => {
  if (serialIssues.length > 0) {
    return (
      <MetaItem label={messages.labelSerialIssues} data-automation-id="publication_serialIssues">
        {serialIssues.map(serialIssue => {
          const name = serialIssue.name
          const subtitle = serialIssue.subtitle ? `: ${serialIssue.subtitle}` : ''
          const issue = serialIssue.issue ? ` (${serialIssue.issue})` : ''
          return `${name}${subtitle}${issue}`
        }).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

SerialIssues.defaultProps = {
  serialIssues: []
}

SerialIssues.propTypes = {
  serialIssues: PropTypes.array.isRequired
}

export const messages = defineMessages({
  labelSerialIssues: {
    id: 'SerialIssues.labelSerialIssues',
    description: 'Label for serialIssues meta',
    defaultMessage: 'Series'
  }
})

export default SerialIssues
