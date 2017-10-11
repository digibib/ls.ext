import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl'
import {Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import {formatDate} from '../utils/dateFormatter'
import isEmpty from '../utils/emptyObject'
import Constants from '../constants/Constants'

const HistoryItem = ({ historyItem, intl }) => {
  return (
    <article key={historyItem.issue_id}
             className="single-entry"
             data-automation-id="UserHistory"
             data-recordid={historyItem.issue_id}>
      <div className="flex-col media-type">
        {historyItem.mediaType !== null
          ? ([<i key="item-icon" className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ historyItem.mediaType ] ]} aria-hidden="true" />,
            <span key="item-text" data-automation-id="UserLoans_reservation_type">{intl.formatMessage({ id: historyItem.mediaType })}
            </span>])
          : null
        }
      </div>
      <div className="flex-col entry-details">
        <Link to={historyItem.relativePublicationPath}>
          {historyItem.title}
        </Link>
        <h2>
        {!isEmpty(historyItem.contributor)
          ? (<Link
            data-automation-id="UserLoans_pickup_author"
            to={fieldQueryLink('aktør', historyItem.contributor.contributorName)}>
            {historyItem.contributor.contributorName}
            </Link>)
          : null
        }
        </h2>
      </div>
      <div className="flex-col return-date">
        <h2><FormattedMessage {...messages.checkedIn} />:</h2>
        <p>{formatDate(historyItem.returnDate)}</p>
      </div>
      <div className="flex-col placeholder-column" />
      <div className="flex-col placeholder-column" />
    </article>
  )
}

HistoryItem.propTypes = {
  historyItem: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  checkedIn: {
    id: 'History.checkedIn',
    description: 'The label checked in column',
    defaultMessage: 'Checked in'
  }
})

export default injectIntl(HistoryItem)
