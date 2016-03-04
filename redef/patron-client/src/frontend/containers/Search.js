import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactPaginate from 'react-paginate'
import { routeActions } from 'react-router-redux'

import * as SearchActions from '../actions/SearchActions'
import SearchResults from '../components/SearchResults'
import SearchFilters from '../components/SearchFilters'
import Constants from '../constants/Constants'

const Search = React.createClass({
  propTypes: {
    searchActions: PropTypes.object.isRequired,
    searchResults: PropTypes.array.isRequired,
    isSearching: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    searchError: PropTypes.any.isRequired,
    filters: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    searchFieldInput: PropTypes.string,
    totalHits: PropTypes.number.isRequired
  },
  handlePageClick (data) {
    let newQuery = Object.assign({},
      this.props.location.query,
      { page: data.selected + 1 }
    )
    this.props.dispatch(routeActions.push({ query: newQuery }))
  },
  renderPagination() {
    if ((this.props.totalHits > Constants.searchQuerySize) && this.props.location.query.query) {
      return (
        <section className='col pagination-area'>
          <ReactPaginate previousLabel={'<'}
                         nextLabel={'>'}
                         breakLabel={<li className='break'><span>...</span></li>}
                         forceSelected={parseInt(this.props.location.query.page) -1 || 0}
                         marginPagesDisplayed={1}
                         pageRangeDisplayed={5}
                         pageNum={Math.ceil(this.props.totalHits / Constants.searchQuerySize)}
                         clickCallback={this.handlePageClick}
                         containerClassName={'pagination'}
                         subContainerClassName={'pages pagination'}
                         activeClassName={'active'}/>
        </section>
      )
    }
  },
  render () {
    return (
      <div className='container'>
        <div className='row'>
          <SearchFilters filters={this.props.filters}
                         locationQuery={this.props.location.query} dispatch={this.props.dispatch}/>
          {this.renderPagination()}
          <SearchResults
            locationQuery={this.props.location.query}
            searchActions={this.props.searchActions}
            searchResults={this.props.searchResults}
            totalHits={this.props.totalHits}
            searchError={this.props.searchError}/>
          {this.renderPagination()}
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
    searchError: state.search.searchError,
    filters: state.search.filters
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
