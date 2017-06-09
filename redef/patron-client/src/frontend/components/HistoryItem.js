import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import {formatDate} from '../utils/dateFormatter'

const HistoryItem = ({ historyItem }) => {
  return (
    <article key={historyItem.issue_id}
             className="single-entry"
             data-automation-id="UserHistory"
             data-recordid={historyItem.issue_id}>
      <div className="flex-col entry-details">
        <h1 style={{ fontWeight: 'normal' }}>{historyItem.title}</h1>
        <h2>
          {historyItem.author
            ? (<span data-automation-id="UserHistory_author">
              {historyItem.author}
            </span>)
            : null
          }
        </h2>
      </div>
      <div className="flex-col entry-details">
        <h2><FormattedMessage {...messages.checkedIn} />:</h2>
        {formatDate(historyItem.returndate)}
      </div>
      <div className="flex-col placeholder-column" />
      <div className="flex-col placeholder-column" />
    </article>
  )
}

export const messages = defineMessages({
  checkedIn: {
    id: 'History.checkedIn',
    description: 'The label checked in column',
    defaultMessage: 'Checked in'
  }
})

export default HistoryItem