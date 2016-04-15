import React, { PropTypes } from 'react'
import shallowEqual from 'fbjs/lib/shallowEqual'
import { defineMessages, FormattedMessage } from 'react-intl'
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
    let entries = []
    if (this.props.locationQuery.query) {
      entries = this.props.searchResults.map(result => (
          <SearchResult key={result.relativeUri} result={result}/>
        )
      )
    }
    return (
      <section className='search-results'>
        <div data-automation-id='search-result-entries'>
          {entries}
        </div>
      </section>
    )
  }
})

const messages = defineMessages({
  searchError: {
    id: 'SearchResults.searchError',
    description: 'A message to display when the search fails',
    defaultMessage: 'Something went wrong with the search #sadpanda'
  }
})
