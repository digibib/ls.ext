import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { defineMessages, FormattedMessage, injectIntl, intlShape } from 'react-intl'
import {Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import {formatDate} from '../utils/dateFormatter'
import * as HistoryActions from '../actions/HistoryActions'

class HistoryItem extends React.Component {

  constructor (props) {
    super(props)
    this.handleChange = this.handleChange.bind(this)
  }

  handleChange (id) {
    console.log(id)
    this.props.historyActions.markHistoryForDeletion(id)
  }

  render () {
    const {historyItem, historyToDelete, intl} = this.props
    return (
      <article key={historyItem.id}
               className="single-entry"
               data-automation-id="UserHistory"
               data-recordid={historyItem.id}>
        <div className="flex-col media-type">
          {historyItem.mediaType !== null
            ? <span key="item-text"> {intl.formatMessage({ id: historyItem.mediaType })}
              </span>
            : null
          }
        </div>
        <div className="flex-col entry-details">
          <Link className="publication-title" to={historyItem.relativePublicationPath}>
            {historyItem.title}
          </Link>
          <h2>
          {historyItem.author
            ? (<Link
              data-automation-id="UserLoans_history_author"
              to={fieldQueryLink('aktør', historyItem.author)}>
              {historyItem.author}
              </Link>)
            : null
          }
          </h2>
          <h2>{historyItem.publicationYear}</h2>
        </div>
        <div className="flex-col placeholder-column" />
        <div className="flex-col return-date">
          <h2><FormattedMessage {...messages.checkedIn} /></h2>
          <h2><strong>{formatDate(historyItem.returnDate)}</strong></h2>
        </div>
        <div className="flex-col delete-history-entry" onClick={e => this.handleChange(historyItem.id)} >
          <input type="checkbox"
                 name={`delete-history-entry-${historyItem.id}`}
                 value="true"
                 data-history-entry-id={historyItem.id}
                 defaultChecked={historyToDelete.includes(historyItem.id)}
                 />
          <label htmlFor={`delete-history-entry-${historyItem.id}`}>
              <span className="checkbox-wrapper" style={{ display: 'inline-block' }}>
                <i className="icon-check-empty checkbox-unchecked" role="checkbox" aria-checked="false" tabIndex="0" />
                <i className="icon-ok-squared checkbox-checked" role="checkbox" aria-checked="true" tabIndex="0" />
              </span>
          </label>
        </div>
      </article>
    )
  }
}

function mapStateToProps (state) {
  return {
    historyToDelete: state.history.historyToDelete
  }
}

HistoryItem.propTypes = {
  historyActions: PropTypes.object.isRequired,
  historyItem: PropTypes.object.isRequired,
  historyToDelete: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  checkedIn: {
    id: 'History.checkedIn',
    description: 'The label checked in column',
    defaultMessage: 'Checked in'
  }
})

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    historyActions: bindActionCreators(HistoryActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(HistoryItem))
