import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import ReactPaginate from 'react-paginate'
import { push } from 'react-router-redux'
import shallowEqual from 'fbjs/lib/shallowEqual'

import * as SearchActions from '../actions/SearchActions'
import * as SearchFilterActions from '../actions/SearchFilterActions'
import * as ResourceActions from '../actions/ResourceActions'
import SearchResults from '../components/SearchResults'
import SearchFilters from '../components/SearchFilters'
import Constants from '../constants/Constants'
import SearchResultsText from '../components/SearchResultsText'

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
    totalHits: PropTypes.number.isRequired,
    locationQuery: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    resourceActions: PropTypes.object.isRequired
  },
  componentWillMount () {
    this.props.searchActions.search()
  },
  componentDidUpdate (prevProps) {
    if (!shallowEqual(this.filterLocationQuery(this.props.locationQuery), this.filterLocationQuery(prevProps.locationQuery))) {
      this.props.searchActions.search()
    }
  },
  filterLocationQuery (locationQuery) {
    const filteredLocationQuery = {}
    Object.keys(locationQuery).filter(key => key.startsWith('filter_') || key === 'query' || key === 'page').forEach(key => {
      filteredLocationQuery[ key ] = locationQuery[ key ]
    })
    return filteredLocationQuery
  },
  handlePageClick (data) {
    let page = String(data.selected + 1)
    if (page !== this.props.location.query.page) {
      let newQuery = {
        ...this.props.location.query,
        page: page
      }
      this.props.dispatch(push({ pathname: '/search', query: newQuery }))
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
                         forceSelected={this.props.location.query.page - 1 || 0}
                         marginPagesDisplayed={1}
                         pageRangeDisplayed={5}
                         pageNum={Math.ceil(this.props.totalHits / Constants.searchQuerySize)}
                         clickCallback={this.handlePageClick}
                         containerClassName={'pagination'}
                         subContainerClassName={'pages pagination'}
                         activeClassName={'active'} />
        </section>
      )
    }
  },
  render () {
    return (
      <div className='container'>
        <div className='row'>
          {this.props.locationQuery.query
            ? (<div className='search-results-footer'>
            <div className='search-results-number'>
              <SearchResultsText totalHits={this.props.totalHits} locationQuery={this.props.locationQuery} />
            </div>
            {this.props.totalHits > 0
              ? (<div className='search-sorting'>
              <p>Sorter treff på</p>

              <div className='search-sorting-select-box'>
                <select>
                  <option defaultValue>Årstall</option>
                  <option>Nyeste</option>
                  <option>Eldre</option>
                </select>
              </div>
            </div>) : null}
          </div>)
            : null}
          {this.props.totalHits > 0
            ? [ <SearchFilters key='searchFilters'
                               filters={this.props.filters}
                               locationQuery={this.props.location.query}
                               toggleFilter={this.props.searchFilterActions.toggleFilter}
                               toggleFilterVisibility={this.props.searchFilterActions.toggleFilterVisibility}
                               toggleAllFiltersVisibility={this.props.searchFilterActions.toggleAllFiltersVisibility}
                               toggleCollapseFilter={this.props.searchFilterActions.toggleCollapseFilter} />,
            <SearchResults key='searchResults'
                           locationQuery={this.props.location.query}
                           searchActions={this.props.searchActions}
                           searchResults={this.props.searchResults}
                           totalHits={this.props.totalHits}
                           searchError={this.props.searchError}
                           fetchWorkResource={this.props.resourceActions.fetchWorkResource}
                           resources={this.props.resources}
            /> ]
            : null}
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
    filters: state.search.filters,
    locationQuery: state.routing.locationBeforeTransitions.query,
    resources: state.resources.resources
  }
}

function mapDispatchToProps (dispatch) {
  return {
    searchActions: bindActionCreators(SearchActions, dispatch),
    searchFilterActions: bindActionCreators(SearchFilterActions, dispatch),
    resourceActions: bindActionCreators(ResourceActions, dispatch),
    dispatch: dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Search)
