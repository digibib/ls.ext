import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl'
import {Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import {formatDate} from '../utils/dateFormatter'
import Constants from '../constants/Constants'

const HistoryItem = ({ historyItem, intl }) => {
  return (
    <article key={historyItem.id}
             className="single-entry"
             data-automation-id="UserHistory"
             data-recordid={historyItem.id}>
      <div className="flex-col media-type">
        {historyItem.mediaType !== null
          ? ([<img className="icon" src={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ historyItem.mediaType ] ]} />,
            <span key="item-text" data-automation-id="UserLoans_reservation_type"> {intl.formatMessage({ id: historyItem.mediaType })}
            </span>])
          : null
        }
      </div>
      <div className="flex-col entry-details">
        <Link to={historyItem.relativePublicationPath}>
          {historyItem.title}
        </Link>
        <h2>
        {historyItem.author
          ? (<Link
            data-automation-id="UserLoans_pickup_author"
            to={fieldQueryLink('aktør', historyItem.author)}>
            {historyItem.author}
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
      <div className="flex-col delete-history-entry">
        <input type="checkbox"
               name="delete-history-entry"
               data-history-entry-id={historyItem.id}
               />
        <label htmlFor="delete-history-entry">
            <span className="checkbox-wrapper" style={{ display: 'inline-block' }}>
              <i className="icon-check-empty checkbox-unchecked" role="checkbox" aria-checked="false" tabIndex="0" />
              <i className="icon-ok-squared checkbox-checked" role="checkbox" aria-checked="true" tabIndex="0" />
            </span>
        </label>
      </div>
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
