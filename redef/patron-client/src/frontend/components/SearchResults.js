import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import SearchResult from './SearchResult'

export default React.createClass({
  propTypes: {
    locationQuery: PropTypes.object,
    searchActions: PropTypes.object.isRequired,
    searchError: PropTypes.any.isRequired,
    totalHits: PropTypes.number.isRequired,
    searchResults: PropTypes.array.isRequired,
    resources: PropTypes.object.isRequired,
    fetchWorkResource: PropTypes.func.isRequired
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
          <SearchResult key={result.relativeUri}
                        result={result}
                        locationQuery={this.props.locationQuery}
                        showStatus={this.props.searchActions.showStatus}
                        fetchWorkResource={this.props.fetchWorkResource}
                        resources={this.props.resources}
          />
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
