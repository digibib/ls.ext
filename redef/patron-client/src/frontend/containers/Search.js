import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as SearchActions from '../actions/SearchActions'
import SearchResults from '../components/SearchResults'
import SearchFilters from '../components/SearchFilters'

const Search = React.createClass({
  propTypes: {
    searchQuery: PropTypes.string.isRequired,
    searchActions: PropTypes.object.isRequired,
    searchResults: PropTypes.array.isRequired,
    isSearching: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    searchError: PropTypes.any.isRequired,
    filtersByQuery: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    searchFieldInput: PropTypes.string,
    totalHits: PropTypes.number.isRequired
  },
  render () {
    return (
      <div className='container'>
        <div className='row'>
          <SearchFilters filtersByQuery={this.props.filtersByQuery[this.props.location.query.query]}
                         locationQuery={this.props.location.query} dispatch={this.props.dispatch}/>
          <SearchResults
            locationQuery={this.props.location.query}
            searchActions={this.props.searchActions}
            searchQuery={this.props.searchFieldInput}
            searchResults={this.props.searchResults}
            totalHits={this.props.totalHits}
            searchError={this.props.searchError}/>
        </div>
      </div>
    )
  }
})

function mapStateToProps (state) {
  return {
    searchResults: state.search.searchResults,
    totalHits: state.search.totalHits,
    isSearching: state.search.isSearching,
    searchQuery: state.search.searchQuery,
    searchError: state.search.searchError,
    filtersByQuery: state.search.filtersByQuery
  }
}

function mapDispatchToProps (dispatch) {
  return {
    searchActions: bindActionCreators(SearchActions, dispatch),
    dispatch: dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search)
