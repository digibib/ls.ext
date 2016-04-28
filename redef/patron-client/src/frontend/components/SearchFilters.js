import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import SearchFilter from './SearchFilter'

export default React.createClass({
  propTypes: {
    filters: PropTypes.array.isRequired,
    locationQuery: PropTypes.object.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    toggleFilterVisibility: PropTypes.func.isRequired,
    toggleAllFiltersVisibility: PropTypes.func.isRequired,
    toggleCollapseFilter: PropTypes.func.isRequired
  },
  getDefaultProps () {
    return {
      filters: []
    }
  },
  renderEmpty () {
    return <div data-automation-id='empty'></div>
  },
  handleFiltersOpenClick () {
    this.props.toggleAllFiltersVisibility()
  },
  render () {
    let groupedFilters = {}
    if (this.props.locationQuery.query && this.props.filters) {
      this.props.filters.forEach(filter => {
        groupedFilters[ filter.aggregation ] = groupedFilters[ filter.aggregation ] || []
        groupedFilters[ filter.aggregation ].push(filter)
      })

      return (
        <aside className='filters'>
          <div className='limit-filters'>
            {this.props.locationQuery.hideFilters === null
              ? (<span className='limit-filters-text'><p>Vis filter</p></span>)
              : (<span className='limit-filters-text'><p>Skjul filter</p></span>)}
            {this.props.locationQuery.hideFilters === null
              ? (<button onClick={this.handleFiltersOpenClick} className='limit-filters-open' type='button'>
              <img src='/images/btn-limit-filter-open.svg' alt='Red arrow pointing down' />
            </button>)
              : (<button onClick={this.handleFiltersOpenClick} className='limit-filters-open' type='button'>
              <img src='/images/btn-limit-filter-close.svg' alt='Red arrow pointing up' />
            </button>)}
          </div>

          <header className='limit-filters-header'>
            <FormattedMessage {...messages.limit} />
          </header>

          <section data-automation-id='search_filters'>
            {this.props.locationQuery.hideFilters === null ? null : Object.keys(groupedFilters).map(aggregation => {
              let filtersByAggregation = groupedFilters[ aggregation ]
              return (
                <SearchFilter
                  key={aggregation}
                  aggregation={aggregation}
                  filters={filtersByAggregation}
                  locationQuery={this.props.locationQuery}
                  toggleFilter={this.props.toggleFilter}
                  toggleFilterVisibility={this.props.toggleFilterVisibility}
                  toggleCollapseFilter={this.props.toggleCollapseFilter}
                />
              )
            })}
          </section>
        </aside>
      )
    } else {
      return this.renderEmpty()
    }
  }
})

const messages = defineMessages({
  limit: {
    id: 'SearchFilters.limit',
    description: 'The header of the filter groups',
    defaultMessage: 'Limit your search'
  }
})
