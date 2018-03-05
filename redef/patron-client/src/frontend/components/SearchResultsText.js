import React, { PropTypes } from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import { defineMessages, FormattedHTMLMessage } from 'react-intl'

class SearchResultsText extends React.Component {
  render () {
    if (!this.props.locationQuery.query) {
      return null
    } else {
      return (
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionLeaveTimeout={0}
          transitionEnterTimeout={500}
          component="div"
          className="search-results-number">
          <span className="marked-yellow">
            <FormattedHTMLMessage {...messages.totalHits}
                                  values={{
                                    searchQuery: this.props.locationQuery.query,
                                    totalHits: String(this.props.totalHits)
                                  }} />
          </span>
        </NonIETransitionGroup>
      )
    }
  }
}

SearchResultsText.propTypes = {
  locationQuery: PropTypes.object,
  totalHits: PropTypes.number.isRequired,
  mediaQueryValues: PropTypes.object
}

export const messages = defineMessages({
  searching: {
    id: 'SearchResultsText.searching',
    description: 'Shown while a search is performed',
    defaultMessage: 'Searching...'
  },
  totalHits: {
    id: 'SearchResultsText.totalHits',
    description: 'The number of total hits spelled out',
    defaultMessage: '<span data-automation-id="hits-total">{totalHits}</span> hits'
  },
  searchForWork: {
    id: 'SearchResultsText.searchForWork',
    description: 'A message to show when no search',
    defaultMessage: 'Search for works'
  }
})

export default SearchResultsText
