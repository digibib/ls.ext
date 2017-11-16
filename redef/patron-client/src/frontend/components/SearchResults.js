import React, {PropTypes} from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import {defineMessages, FormattedMessage} from 'react-intl'
import SearchResult from './SearchResult'

class SearchResults extends React.Component {
  render () {
    if (this.props.searchError) {
      return (
        <p data-automation-id="search-error">
          <FormattedMessage {...messages.searchError} />
        </p>
      )
    }
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        id="main-search-content"
        className="search-results">
        <div data-automation-id="search-result-entries" className="search-results-list">
          {this.props.locationQuery.query
            ? this.props.searchResults.map(result => (
            <SearchResult key={result.relativeUri}
                          result={result}
                          locationQuery={this.props.locationQuery}
                          showStatus={this.props.searchActions.showStatus}
                          showUnfilteredStatus={this.props.searchActions.showUnfilteredStatus}
                          showBranchStatus={this.props.searchActions.showBranchStatus}
                          showBranchStatusMedia={this.props.searchActions.showBranchStatusMedia}
                          fetchWorkResource={this.props.fetchWorkResource}
                          resources={this.props.resources}
                          items={this.props.items}
                          homeBranch={this.props.homeBranch}
            />
          )) : null}
        </div>
      </NonIETransitionGroup>
    )
  }
}

SearchResults.propTypes = {
  locationQuery: PropTypes.object,
  searchActions: PropTypes.object.isRequired,
  searchError: PropTypes.any.isRequired,
  totalHits: PropTypes.number.isRequired,
  searchResults: PropTypes.array.isRequired,
  resources: PropTypes.object.isRequired,
  fetchWorkResource: PropTypes.func.isRequired,
  items: PropTypes.object.isRequired,
  page: PropTypes.any.isRequired,
  homeBranch: PropTypes.string
}

export const messages = defineMessages({
  searchError: {
    id: 'SearchResults.searchError',
    description: 'A message to display when the search fails',
    defaultMessage: 'Something went wrong with the search #sadpanda'
  }
})

SearchResults.defaultProps = { page: 1 }
export default SearchResults
