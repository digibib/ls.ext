import React, { PropTypes } from 'react'

const HistoryItem = ({ historyItem }) => {
  return (
    <article key={historyItem.issue_id}
             className="single-entry"
             data-automation-id="User_history"
             data-recordid={historyItem.issue_id}>
      <div className="flex-col entry-details">
        {historyItem.title}
      </div>
    </article>
  )

}

export default HistoryItem