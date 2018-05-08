import PropTypes from 'prop-types'
import React from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import {defineMessages, FormattedMessage} from 'react-intl' //, injectIntl, intlShape
import SearchResultsText from '../components/SearchResultsText'
// import {connect} from 'react-redux'
// import {bindActionCreators} from 'redux'

class SearchResultsHeader extends React.Component {
  render () {
    if (this.props.searchError) {
      return (
        <p data-automation-id="search-error">
          <FormattedMessage {...messages.searchError} />
        </p>
      )
    }
    if (!this.props.locationQuery.query) {
      return null
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
        <div className="search-results-header-flex">
          <SearchResultsText
            totalHits={this.props.totalHits}
            locationQuery={this.props.locationQuery}
          />
        </div>
      </NonIETransitionGroup>
    )
  }
}

SearchResultsHeader.propTypes = {
  locationQuery: PropTypes.object,
  searchActions: PropTypes.object.isRequired,
  searchError: PropTypes.any.isRequired,
  totalHits: PropTypes.number.isRequired
}

export const messages = defineMessages({
  searchError: {
    id: 'SearchResults.searchError',
    description: 'A message to display when the search fails',
    defaultMessage: 'Something went wrong with the search #sadpanda'
  }
})

export default SearchResultsHeader
