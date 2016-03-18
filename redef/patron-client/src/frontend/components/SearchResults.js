import React, { PropTypes } from 'react'
import shallowEqual from 'fbjs/lib/shallowEqual'
import { defineMessages, FormattedMessage, FormattedHTMLMessage } from 'react-intl'

import SearchResult from './SearchResult'

export default React.createClass({
  propTypes: {
    locationQuery: PropTypes.object,
    searchActions: PropTypes.object.isRequired,
    searchError: PropTypes.any.isRequired,
    totalHits: PropTypes.number.isRequired,
    searchResults: PropTypes.array.isRequired
  },
  componentWillMount () {
    this.props.searchActions.search()
  },
  componentDidUpdate (prevProps) {
    if (!shallowEqual(this.props.locationQuery, prevProps.locationQuery)) {
      this.props.searchActions.search()
    }
  },
  render () {
    if (this.props.searchError) {
      return (
        <p data-automation-id='search-error'>
          <FormattedMessage {...messages.searchError} />
        </p>
      )
    }
    let resultsText
    if (!this.props.locationQuery.query) {
      resultsText = <h3 data-automation-id='no-search'><FormattedMessage {...messages.searchForWork} /></h3>
    } else {
      resultsText = (
        <h3><FormattedHTMLMessage {...messages.totalHits}
          values={{ searchQuery: this.props.locationQuery.query, totalHits: this.props.totalHits }}/></h3>
      )
    }
    let entries = []
    if (this.props.locationQuery.query) {
      entries = this.props.searchResults.map(function (result) {
        return (<SearchResult key={result.relativeUri} result={result}/>)
      })
    }
    return (
      <section className='col search-results'>
        <div className='panel'>
          {resultsText}
        </div>
        <div data-automation-id='search-result-entries'>
          {entries}
        </div>
      </section>
    )
  }
})

const messages = defineMessages({
  totalHits: {
    id: 'SearchResults.totalHits',
    description: 'The number of total hits spelled out',
    defaultMessage: 'Your search for "<span data-automation-id="current-search-term">{searchQuery}</span>" resulted in <span data-automation-id="hits-total">{totalHits}</span> hits'
  },
  searchError: {
    id: 'SearchResults.searchError',
    description: 'A message to display when the search fails',
    defaultMessage: 'Something went wrong with the search #sadpanda'
  },
  searchForWork: {
    id: 'SearchResults.searchForWork',
    description: 'A message to show when no search',
    defaultMessage: 'Search for works'
  }
})
