import React, { PropTypes } from 'react'
import { defineMessages, FormattedHTMLMessage } from 'react-intl'
import MediaQuery from 'react-responsive'

export default React.createClass({
  propTypes: {
    locationQuery: PropTypes.object,
    totalHits: PropTypes.number.isRequired,
    mediaQueryValues: PropTypes.object
  },
  render () {
    if (!this.props.locationQuery.query) {
      return null
    } else {
      return (
        <p>
          <MediaQuery query='(min-width: 668px)' values={{...this.props.mediaQueryValues}}>
            <FormattedHTMLMessage {...messages.totalHits}
              values={{ searchQuery: this.props.locationQuery.query, totalHits: String(this.props.totalHits) }} />
          </MediaQuery>
          <MediaQuery query='(max-width: 667px)' values={{...this.props.mediaQueryValues}}>
            <FormattedHTMLMessage {...messages.totalHitsMobile}
              values={{ searchQuery: this.props.locationQuery.query, totalHits: String(this.props.totalHits) }} />
          </MediaQuery>
        </p>
      )
    }
  }
})

const messages = defineMessages({
  totalHits: {
    id: 'SearchResultsText.totalHits',
    description: 'The number of total hits spelled out',
    defaultMessage: '<span data-automation-id="hits-total">{totalHits}</span> hits for "<span data-automation-id="current-search-term" class="result-name">{searchQuery}</span>"'
  },
  totalHitsMobile: {
    id: 'SearchResultsText.totalHitsMobile',
    description: 'The number of total hits spelled out, for mobile screens',
    defaultMessage: '<span data-automation-id="hits-total">{totalHits}</span> hits'
  },
  searchForWork: {
    id: 'SearchResultsText.searchForWork',
    description: 'A message to show when no search',
    defaultMessage: 'Search for works'
  }
})
