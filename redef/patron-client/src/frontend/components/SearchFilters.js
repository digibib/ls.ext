import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { defineMessages, FormattedMessage } from 'react-intl'
import SearchFilter from './SearchFilter'

class SearchFilters extends React.Component {
  constructor (props) {
    super(props)
    this.handleFiltersOpenClick = this.handleFiltersOpenClick.bind(this)
  }

  renderEmpty () {
    return <div data-automation-id="empty" />
  }

  handleFiltersOpenClick (event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.toggleAllFiltersVisibility()
  }

  render () {
    const groupedFilters = {}
    const buttonClass = (this.props.locationQuery.hideFilters === null) ? 'filters-hidden' : 'filters-visible'
    if (this.props.locationQuery.query && this.props.filters) {
      this.props.filters.forEach(filter => {
        const aggregation = filter.id.split('_')[0]
        groupedFilters[ aggregation ] = groupedFilters[ aggregation ] || []
        groupedFilters[ aggregation ].push(filter)
      })

      return (
        <aside className="filters">
          <div className="limit-filters">
            <Link className={buttonClass} to="#" onClick={this.handleFiltersOpenClick}>
            {this.props.locationQuery.hideFilters === null
              ? (<span>Vis filter</span>)
              : (<span>Skjul filter</span>)}
            </Link>
          </div>

          <header className="limit-filters-header">
            <FormattedMessage {...messages.limit} />
          </header>

          <section className="filter-wrapper"
                   data-automation-id="search_filters">
            {this.props.locationQuery.hideFilters === null ? null : Object.keys(groupedFilters).map(aggregation => {
              const filtersByAggregation = groupedFilters[ aggregation ]
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
}

SearchFilters.propTypes = {
  filters: PropTypes.array.isRequired,
  locationQuery: PropTypes.object.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  toggleFilterVisibility: PropTypes.func.isRequired,
  toggleAllFiltersVisibility: PropTypes.func.isRequired,
  toggleCollapseFilter: PropTypes.func.isRequired
}

SearchFilters.defaultProps = { filters: [] }

const messages = defineMessages({
  limit: {
    id: 'SearchFilters.limit',
    description: 'The header of the filter groups',
    defaultMessage: 'Limit your search'
  }
})

export default SearchFilters
