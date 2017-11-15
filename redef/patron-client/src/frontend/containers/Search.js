import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import {bindActionCreators} from 'redux'
import {connect} from 'react-redux'
import ReactPaginate from 'react-paginate'
import {push} from 'react-router-redux'
import shallowEqual from 'fbjs/lib/shallowEqual'
import {defineMessages, injectIntl, intlShape} from 'react-intl'

import * as SearchActions from '../actions/SearchActions'
import * as SearchFilterActions from '../actions/SearchFilterActions'
import * as ResourceActions from '../actions/ResourceActions'
import * as RegistrationActions from '../actions/RegistrationActions'
import SearchResults from '../components/SearchResults'
import SearchResultsHeader from '../components/SearchResultsHeader'
import SearchFilters from '../components/SearchFilters'
import Constants from '../constants/Constants'
import SearchFilterBox from '../components/SearchFilterBox'

class Search extends React.Component {
  constructor (props) {
    super(props)
    this.handlePageClick = this.handlePageClick.bind(this)
    this.removeAllFilters = this.removeAllFilters.bind(this)
  }

  componentWillMount () {
    this.props.searchActions.search()
  }

  componentDidMount () {
    if (this.props.location.pathname === '/register') {
      this.props.registrationActions.startRegistration()
    }
  }

  componentDidUpdate (prevProps) {
    if (!shallowEqual(this.filterLocationQuery(this.props.locationQuery), this.filterLocationQuery(prevProps.locationQuery))) {
      this.props.searchActions.search()
    }
  }

  filterLocationQuery (locationQuery) {
    const filteredLocationQuery = {}
    Object.keys(locationQuery).filter(key => [ 'query', 'filter', 'yearFrom', 'yearTo', 'excludeUnavailable', 'page', 'includeWithoutItems' ].includes(key)).forEach(key => {
      filteredLocationQuery[ key ] = locationQuery[ key ]
    })
    return filteredLocationQuery
  }

  removeAllFilters () {
    this.props.dispatch(push({ pathname: '/search', query: { query: this.props.locationQuery.query } }))
  }

  handlePageClick (data) {
    const page = String(data.selected + 1)
    if (page !== this.props.location.query.page) {
      const newQuery = {
        ...this.props.location.query,
        page: page
      }
      this.props.dispatch(push({ pathname: '/search', query: newQuery }))
      ReactDOM.findDOMNode(this).scrollIntoView()
    }
  }

  renderPagination () {
    if ((this.props.totalHits > Constants.maxSearchResultsPerPage) && this.props.location.query.query) {
      return (
        <section className="pagination-area"
                 data-automation-id="search-results-pagination">
          <nav aria-label={this.props.intl.formatMessage(messages.paginationLabel)}>
            <ReactPaginate
              previousLabel={<span aria-label={this.props.intl.formatMessage(messages.paginationPrevious)}>&lt;</span>}
              nextLabel={<span aria-label={this.props.intl.formatMessage(messages.paginationNext)}>&gt;</span>}
              breakLabel={<span aria-hidden="true">...</span>}
              forcePage={this.props.location.query.page - 1 || 0}
              marginPagesDisplayed={1}
              pageRangeDisplayed={5}
              pageCount={Math.ceil(Math.min(this.props.totalHits, 10000) / Constants.maxSearchResultsPerPage)}
              onPageChange={this.handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
              items={this.props.items}
            />
          </nav>
        </section>
      )
    }
  }

  manageMobileHeaders () {
    if (this.props.windowWidth < 668) {
      return (
        <div>

                    <SearchResultsHeader key="search_results_header"
                      locationQuery={this.props.location.query}
                      searchActions={this.props.searchActions}
                      searchError={this.props.searchError}
                      totalHits={this.props.totalHits}
                    />
                    <SearchFilters key="search_filters"
                                   filters={this.props.filters}
                                   locationQuery={this.props.location.query}
                                   toggleFilter={this.props.searchFilterActions.toggleFilter}
                                   toggleFilterVisibility={this.props.searchFilterActions.toggleFilterVisibility}
                                   toggleAllFiltersVisibility={this.props.searchFilterActions.toggleAllFiltersVisibility}
                                   toggleCollapseFilter={this.props.searchFilterActions.toggleCollapseFilter}
                                   togglePeriod={this.props.searchFilterActions.togglePeriod}
                                   toggleAvailability={this.props.searchFilterActions.toggleAvailability}
                                   toggleHideNoItems={this.props.searchFilterActions.toggleHideNoItems}
                                   scrollTargetNode={this}
                                   isSearching={this.props.isSearching}
                                   windowWidth={this.props.windowWidth}
                    />

        </div>

      )
    } else {
      return (
          <div>
            <SearchFilters key="search_filters"
                           filters={this.props.filters}
                           locationQuery={this.props.location.query}
                           toggleFilter={this.props.searchFilterActions.toggleFilter}
                           toggleFilterVisibility={this.props.searchFilterActions.toggleFilterVisibility}
                           toggleAllFiltersVisibility={this.props.searchFilterActions.toggleAllFiltersVisibility}
                           toggleCollapseFilter={this.props.searchFilterActions.toggleCollapseFilter}
                           togglePeriod={this.props.searchFilterActions.togglePeriod}
                           toggleAvailability={this.props.searchFilterActions.toggleAvailability}
                           toggleHideNoItems={this.props.searchFilterActions.toggleHideNoItems}
                           scrollTargetNode={this}
                           isSearching={this.props.isSearching}
                           windowWidth={this.props.windowWidth}
            />

              <SearchResultsHeader key="search_results_header"
                locationQuery={this.props.location.query}
                searchActions={this.props.searchActions}
                searchError={this.props.searchError}
                totalHits={this.props.totalHits}
              />
          </div>
      )
    }
  }

  render () {
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="main"
        role="main"
        className="wrapper">
        {this.props.locationQuery.query
          ? (<div className="search-results-header">
            <a href="#main-search-content" className="is-vishidden focusable">{this.props.intl.formatMessage(messages.jumpToMainContent)}</a>
          <div className="search-results-summary">
            {!this.props.isSearching && this.props.totalHitsPublications === 0
             ? <div className="search-no-hits">
                <p>{this.props.intl.formatMessage(messages.noHitsHeading)}</p>
                <SearchFilterBox
                  path={this.props.location.pathname}
                  query={this.props.locationQuery}
                  toggleFilter={this.props.searchFilterActions.toggleFilter}
                  removePeriod={this.props.searchFilterActions.removePeriod}
                  toggleAvailability={this.props.searchFilterActions.toggleAvailability}
                  removeAllFilters={this.props.searchFilterActions.removeAllFilters} />
                <p>{this.props.intl.formatMessage(messages.noHitsTry)}</p>
                <ul>
                  <li>{this.props.intl.formatMessage(messages.noHitsTryA)}</li>
                  <li>{this.props.intl.formatMessage(messages.noHitsTryB)}</li>
                  <li>{this.props.intl.formatMessage(messages.noHitsTryC)}</li>
                  <li>{this.props.intl.formatMessage(messages.noHitsTryD)}</li>
                </ul>
              </div>
              : null }
          </div>
            {this.props.totalHits > 0
              ? <SearchFilterBox
                path={this.props.location.pathname}
                query={this.props.locationQuery}
                toggleFilter={this.props.searchFilterActions.toggleFilter}
                removePeriod={this.props.searchFilterActions.removePeriod}
                toggleAvailability={this.props.searchFilterActions.toggleAvailability}
                removeAllFilters={this.props.searchFilterActions.removeAllFilters} />
              : null}
          {this.props.totalHits > 0
            ? (<div className="search-sorting patron-placeholder">
            <p>Sorter treff på</p>

            <div className="search-sorting-select-box">
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
          ? <div className="search-wrapper">
            <div className="sticky-wrapper">
            {this.manageMobileHeaders()}
            </div>
              <SearchResults key="search_results"
                           locationQuery={this.props.location.query}
                           searchActions={this.props.searchActions}
                           searchResults={this.props.searchResults}
                           totalHits={this.props.totalHits}
                           searchError={this.props.searchError}
                           fetchWorkResource={this.props.resourceActions.fetchWorkResource}
                           resources={this.props.resources}
                           page={Number(this.props.location.query.page || '1')}
                           items={this.props.items}
                           homeBranch={this.props.userProfile.homeBranch}
                           filters={this.props.filters}
                           toggleFilter={this.props.searchFilterActions.toggleFilter}
                           toggleFilterVisibility={this.props.searchFilterActions.toggleFilterVisibility}
                           toggleAllFiltersVisibility={this.props.searchFilterActions.toggleAllFiltersVisibility}
                           toggleCollapseFilter={this.props.searchFilterActions.toggleCollapseFilter}
                           togglePeriod={this.props.searchFilterActions.togglePeriod}
                           toggleAvailability={this.props.searchFilterActions.toggleAvailability}
                           toggleHideNoItems={this.props.searchFilterActions.toggleHideNoItems}
                           scrollTargetNode={this}
                           isSearching={this.props.isSearching}
                           windowWidth={this.props.windowWidth}
              />
            </div>
          : null}
        {this.renderPagination()}
      </NonIETransitionGroup>
    )
  }
}

Search.propTypes = {
  registrationActions: PropTypes.object,
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
  totalHitsPublications: PropTypes.number.isRequired,
  locationQuery: PropTypes.object.isRequired,
  resources: PropTypes.object.isRequired,
  resourceActions: PropTypes.object.isRequired,
  items: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  windowWidth: PropTypes.number.isRequired,
  userProfile: PropTypes.object
}

const intlSearch = injectIntl(Search)
export { intlSearch as Search }

function mapStateToProps (state) {
  return {
    searchResults: state.search.searchResults,
    totalHits: state.search.totalHits,
    totalHitsPublications: state.search.totalHitsPublications,
    isSearching: state.search.isSearching,
    searchError: state.search.searchError,
    filters: state.search.filters,
    locationQuery: state.routing.locationBeforeTransitions.query,
    resources: state.resources.resources,
    items: state.resources.items,
    windowWidth: state.application.windowWidth,
    userProfile: state.profile
  }
}

function mapDispatchToProps (dispatch) {
  return {
    searchActions: bindActionCreators(SearchActions, dispatch),
    searchFilterActions: bindActionCreators(SearchFilterActions, dispatch),
    resourceActions: bindActionCreators(ResourceActions, dispatch),
    registrationActions: bindActionCreators(RegistrationActions, dispatch),
    dispatch: dispatch
  }
}

export const messages = defineMessages({
  jumpToMainContent: {
    id: 'Search.jumpToMainContent',
    description: 'Jump to main content on search page',
    defaultMessage: 'Jump to search results'
  },
  paginationLabel: {
    id: 'Search.paginationLabel',
    description: 'The ARIA label for the pagination bar',
    defaultMessage: 'Pagination'
  },
  paginationNext: {
    id: 'Search.paginationNext',
    description: 'The ARIA label for the "next" link',
    defaultMessage: 'Next'
  },
  paginationPrevious: {
    id: 'Search.paginationPrevious',
    description: 'The ARIA label frot the "previous" link',
    defaultMessage: 'Previous'
  },
  noHitsHeading: {
    id: 'Search.noHitsHeading',
    description: 'The heading of text describing no hits',
    defaultMessage: 'Your search returned no results.'
  },
  noHitsTry: {
    id: 'Search.noHitsTry',
    description: 'Message describing what to do when you get no hits',
    defaultMessage: 'You can try one of the following:'
  },
  noHitsTryA: {
    id: 'Search.noHitsTryA',
    description: 'No hits? Try this part I',
    defaultMessage: 'check your spelling'
  },
  noHitsTryB: {
    id: 'Search.noHitsTryB',
    description: 'No hits? Try this part II',
    defaultMessage: 'use fewer terms'
  },
  noHitsTryC: {
    id: 'Search.noHitsTryC',
    description: 'No hits? Try this part III',
    defaultMessage: 'try other keywords'
  },
  noHitsTryD: {
    id: 'Search.noHitsTryD',
    description: 'No hits? Try this part IV',
    defaultMessage: 'try to remove filters'
  }
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Search))
