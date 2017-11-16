import React, { PropTypes } from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import { Link } from 'react-router'
import { defineMessages, FormattedMessage } from 'react-intl'
import SearchFilter from './SearchFilter'
import Constants from '../constants/Constants'

import DataRangeFilter from '../components/DateRangeFilter'
import AvailableFilter from '../components/AvailableFilter'
import NoItemsFilter from '../components/NoItemsFilter'
import Sticky from 'react-sticky-el'

class SearchFilters extends React.Component {
  constructor (props) {
    super(props)
    this.handleFiltersOpenClick = this.handleFiltersOpenClick.bind(this)
    this.toggleFilterVisibility = this.toggleFilterVisibility.bind(this)
  }

  componentDidMount () {
    this.toggleFilterVisibility()
  }

  componentWillUpdate (nextProps) {
    const previousWidth = this.props.windowWidth
    const currentWidth = nextProps.windowWidth
    if (previousWidth !== currentWidth && ((previousWidth >= 668 && currentWidth < 668) || previousWidth < 668 && currentWidth >= 668)) {
      this.toggleFilterVisibility()
    }
  }

  renderEmpty () {
    return <div data-automation-id="empty" />
  }

  handleFiltersOpenClick (event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.toggleAllFiltersVisibility()
  }

  toggleFilterVisibility (event) {
    if (event && event.target.innerWidth === this.props.windowWidth) {
      return
    }
    if (window.innerWidth < 668) {                           // If screen size is mobile
      if (this.props.locationQuery.hideFilters !== Constants.enabledParameter) { // And filters are visible
        this.props.toggleAllFiltersVisibility()             // Hide the filters
      }
    } else {                                                // If screen size is tatblet or above
      if (this.props.locationQuery.hideFilters === Constants.enabledParameter) { // And filters are hidden
        this.props.toggleAllFiltersVisibility()             // Show the filters
      }
    }
  }

  render () {
    const groupedFilters = {}
    const buttonClass = (this.props.locationQuery.hideFilters === Constants.enabledParameter) ? 'filters-hidden' : 'filters-visible'

    if (this.props.locationQuery.query && this.props.filters) {
      this.props.filters.forEach(filter => {
        const aggregation = filter.id.split('_')[ 0 ]
        groupedFilters[ aggregation ] = groupedFilters[ aggregation ] || []
        groupedFilters[ aggregation ].push(filter)
      })
      const branchFilter = groupedFilters[ 'branch' ]
      delete groupedFilters[ 'branch' ]

      return (
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="aside"
          className="filters">

          {this.props.locationQuery.hideFilters === Constants.enabledParameter
            ? <div className="limit-filters">
            <Link className={buttonClass} to="#" onClick={this.handleFiltersOpenClick}>
              <span>Vis filter</span>
            </Link>
          </div>
          : <Sticky id="stuck" boundaryElement=".filters">
              <div className="limit-filters">
              <Link className={buttonClass} to="#" onClick={this.handleFiltersOpenClick}>
                <span>Skjul filter</span>
              </Link>
            </div>
          </Sticky>}
            <header className="limit-filters-header">
            <FormattedMessage {...messages.limit} />
          </header>

          <section className="filter-wrapper"
                   data-automation-id="search_filters">
            {this.props.locationQuery.hideFilters === Constants.enabledParameter
              ? null
              : <AvailableFilter
                toggleAvailability={this.props.toggleAvailability}
                isChecked={this.props.locationQuery.hasOwnProperty('excludeUnavailable')}
                scrollTargetNode={this.props.scrollTargetNode}
              />
            }

            {this.props.locationQuery.hideFilters === Constants.enabledParameter
              ? null
              : <SearchFilter
                  key="branch"
                  aggregation="branch"
                  filters={branchFilter}
                  locationQuery={this.props.locationQuery}
                  toggleFilter={this.props.toggleFilter}
                  toggleFilterVisibility={this.props.toggleFilterVisibility}
                  toggleAllFilters={this.toggleFilterVisibility}
                  toggleCollapseFilter={this.props.toggleCollapseFilter}
                  scrollTargetNode={this.props.scrollTargetNode}
                  first
                />
            }
            {this.props.locationQuery.hideFilters === Constants.enabledParameter
              ? null
              : <DataRangeFilter
                togglePeriod={this.props.togglePeriod}
              />
            }
            {this.props.locationQuery.hideFilters === Constants.enabledParameter ? null : Object.keys(groupedFilters).map(aggregation => {
              const filtersByAggregation = groupedFilters[ aggregation ]
              return (
                <SearchFilter
                  key={aggregation}
                  aggregation={aggregation}
                  filters={filtersByAggregation}
                  locationQuery={this.props.locationQuery}
                  toggleFilter={this.props.toggleFilter}
                  toggleFilterVisibility={this.props.toggleFilterVisibility}
                  toggleAllFilters={this.toggleFilterVisibility}
                  toggleCollapseFilter={this.props.toggleCollapseFilter}
                  scrollTargetNode={this.props.scrollTargetNode}
                />
              )
            })}
            {this.props.locationQuery.hideFilters === Constants.enabledParameter
              ? null
              : <NoItemsFilter
                toggleHideNoItems={this.props.toggleHideNoItems}
                isChecked={!this.props.locationQuery.hasOwnProperty('includeWithoutItems')}
                scrollTargetNode={this.props.scrollTargetNode}
              />
            }
          </section>
        </NonIETransitionGroup>
      )
    } else {
      return this.renderEmpty()
    }
  }
}

SearchFilters.propTypes = {
  filters: PropTypes.array.isRequired,
  locationQuery: PropTypes.object.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  toggleFilterVisibility: PropTypes.func.isRequired,
  toggleAllFiltersVisibility: PropTypes.func.isRequired,
  toggleCollapseFilter: PropTypes.func.isRequired,
  toggleAvailability: PropTypes.func.isRequired,
  toggleHideNoItems: PropTypes.func.isRequired,
  scrollTargetNode: PropTypes.object.isRequired,
  isSearching: PropTypes.bool,
  windowWidth: PropTypes.number.isRequired,
  togglePeriod: PropTypes.func.isRequired
}

SearchFilters.defaultProps = { filters: [] }

export const messages = defineMessages({
  limit: {
    id: 'SearchFilters.limit',
    description: 'The header of the filter groups',
    defaultMessage: 'Limit your search'
  }
})

export default SearchFilters
