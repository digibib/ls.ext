import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl'

export default React.createClass({
  propTypes: {
    locationQuery: PropTypes.object,
    totalHits: PropTypes.number.isRequired
  },
  render () {
    if (!this.props.locationQuery.query) {
      return <p data-automation-id='no-search'><FormattedMessage {...messages.searchForWork} /></p>
    } else {
      return (
        <p><FormattedHTMLMessage {...messages.totalHits}
          values={{ searchQuery: this.props.locationQuery.query, totalHits: String(this.props.totalHits) }} /></p>
      )
    }
  }
})

const messages = defineMessages({
  totalHits: {
    id: 'SearchResultsText.totalHits',
    description: 'The number of total hits spelled out',
    defaultMessage: 'Your search for "<span data-automation-id="current-search-term">{searchQuery}</span>" resulted in <span data-automation-id="hits-total">{totalHits}</span> hits'
  },
  searchForWork: {
    id: 'SearchResultsText.searchForWork',
    description: 'A message to show when no search',
    defaultMessage: 'Search for works'
  }
})
