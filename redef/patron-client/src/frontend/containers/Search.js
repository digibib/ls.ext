import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactPaginate from 'react-paginate'
import { push } from 'react-router-redux'

import * as SearchActions from '../actions/SearchActions'
import * as SearchFilterActions from '../actions/SearchFilterActions'
import SearchResults from '../components/SearchResults'
import SearchFilters from '../components/SearchFilters'
import Constants from '../constants/Constants'

const Search = React.createClass({
  propTypes: {
    searchActions: PropTypes.object.isRequired,
    searchFilterActions: PropTypes.object.isRequired,
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
    let page = String(data.selected + 1)
    if (page !== this.props.location.query.page) {
      let newQuery = {
        ...this.props.location.query,
        page: page
      }
      this.props.dispatch(push({ query: newQuery }))
    }
  },
  renderPagination () {
    if ((this.props.totalHits > Constants.searchQuerySize) && this.props.location.query.query) {
      return (
        <section className='pagination-area'
                 data-automation-id='search-results-pagination'>
          <ReactPaginate previousLabel={'<'}
                         nextLabel={'>'}
                         breakLabel={<li className='break'><span>...</span></li>}
                         initialSelected={this.props.location.query.page - 1 || 0}
                         forceSelected={this.props.location.query.page - 1 || 0}
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
                         locationQuery={this.props.location.query}
                         setFilter={this.props.searchFilterActions.setFilter}
                         setFiltersVisibility={this.props.searchFilterActions.setFiltersVisibility}
                         setAllFiltersVisibility={this.props.searchFilterActions.setAllFiltersVisibility}
                         collapseFilter={this.props.searchFilterActions.collapseFilter}
          />
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

export { Search as Search }

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
    searchFilterActions: bindActionCreators(SearchFilterActions, dispatch),
    dispatch: dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search)
