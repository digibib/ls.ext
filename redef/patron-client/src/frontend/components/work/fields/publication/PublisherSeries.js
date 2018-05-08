import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const PublisherSeries = ({ publisherSeries }) => {
  if (publisherSeries.length > 0) {
    return (
      <MetaItem label={messages.publisherSeries} data-automation-id="publication_publisherSeries">
        {publisherSeries.map(serialIssue =>
          <span key={publisherSeries.id} data-automation-id="publication_serial_issue">
            <span data-automation-id="publication_serial_issue_name">{serialIssue.name}</span>
            <span
              data-automation-id="publication_serial_issue_subtitle">{((serialIssue.subtitle) ? ` — ${serialIssue.subtitle}` : '')}</span>
            <span>{': '}</span>
            <span data-automation-id="publication_serial_issue_issue"> {serialIssue.issue}</span>
          </span>
        )}
      </MetaItem>
    )
  } else {
    return null
  }
}

PublisherSeries.defaultProps = {
  publisherSeries: []
}

PublisherSeries.propTypes = {
  publisherSeries: PropTypes.array.isRequired
}

export const messages = defineMessages({
  publisherSeries: {
    id: 'PublisherSeries.publisherSeries',
    description: 'Label for publisher series meta',
    defaultMessage: 'Series'
  }
})

export default PublisherSeries
