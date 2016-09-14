import React, { PropTypes } from 'react'
import Constants from '../constants/Constants'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import SearchFilterItem from './SearchFilterItem'

class SearchFilter extends React.Component {
  constructor (props) {
    super(props)
    this.handleCollapse = this.handleCollapse.bind(this)
    this.handleShowAllClick = this.handleShowAllClick.bind(this)
  }

  handleShowAllClick () {
    this.props.toggleFilterVisibility(this.props.aggregation)
  }

  renderEmpty () {
    return <div data-automation-id="empty" />
  }

  shouldShowMore () {
    const { aggregation, locationQuery: { showMore } } = this.props
    return (showMore && showMore === aggregation || (Array.isArray(showMore) && showMore.includes(aggregation)))
  }

  isCollapsed () {
    const { aggregation, locationQuery: { collapse } } = this.props
    return (collapse && collapse === aggregation || (Array.isArray(collapse) && collapse.includes(aggregation)))
  }

  renderFilters () {
    if (this.isCollapsed()) {
      return
    }
    return [ ...this.props.filters ].sort((a, b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0))
      .map((filter, index) => {
        if (!this.shouldShowMore() && index >= Constants.maxVisibleFilterItems) {
          return
        }
        return (
          <SearchFilterItem key={filter.id}
                            filter={filter}
                            toggleFilter={this.props.toggleFilter} />
        )
      })
  }

  handleCollapse () {
    this.props.toggleCollapseFilter(this.props.aggregation)
  }

  renderTitle () {
    return messages[ this.props.aggregation ]
      ? this.props.intl.formatMessage(messages[ this.props.aggregation ])
      : this.props.aggregation
  }

  renderShowMore () {
    if (this.props.filters.length <= Constants.maxVisibleFilterItems) {
      return
    }
    return (
      <div className="show-more" onClick={this.handleShowAllClick}>
        <h3>{this.shouldShowMore() || this.props.filters.length <= Constants.maxVisibleFilterItems
          ? <FormattedMessage {...messages.showLess} />
          : <FormattedMessage {...messages.showMore} />}</h3>
      </div>
    )
  }

  render () {
    if (!this.props.filters || this.props.filters.size === 0) {
      return this.renderEmpty()
    }
    return (
      <div className="filter-group"
           data-automation-id={`filter_${this.props.aggregation}`}>
        <header className="filterTitle">
          <h1>{this.renderTitle()}</h1>
          <button onClick={this.handleCollapse} className="single-filter-close" type="button">
            {this.isCollapsed()
              ? <img src="/images/btn-single-filter-open.svg" alt="Black circle with plus" />
              : <img src="/images/btn-single-filter-close.svg" alt="Black circle with dash" />}
          </button>
        </header>
        {this.isCollapsed() ? null
          : [ <section className="filter-list" key="searchfilter_header">
          <ul className="searchfilters">{this.renderFilters()}</ul>
        </section>,
          <footer key="searchfilter_footer">{this.renderShowMore()}</footer> ]}
      </div>
    )
  }
}

SearchFilter.propTypes = {
  aggregation: PropTypes.string.isRequired,
  filters: PropTypes.array,
  toggleFilter: PropTypes.func.isRequired,
  toggleFilterVisibility: PropTypes.func.isRequired,
  toggleCollapseFilter: PropTypes.func.isRequired,
  locationQuery: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

const messages = defineMessages({
  showMore: {
    id: 'SearchFilter.showMore',
    description: 'Shown when too many filters',
    defaultMessage: 'Show more +'
  },
  showLess: {
    id: 'SearchFilter.showLess',
    description: 'Shown when possible to display fewer filters',
    defaultMessage: 'Show less -'
  },
  format: {
    id: 'SearchFilter.filter[work.publications.formats]',
    description: 'Label of the format filter',
    defaultMessage: 'Format'
  },
  language: {
    id: 'SearchFilter.filter[work.publications.languages]',
    description: 'Label of the language filter',
    defaultMessage: 'Language'
  },
  audience: {
    id: 'SearchFilter.filter[work.publications.audiences]',
    description: 'Label of the audience filter',
    defaultMessage: 'Audience'
  },
  branch: {
    id: 'SearchFilter.filter[work.publications.branches]',
    description: 'Label of the branches filter',
    defaultMessage: 'Department'
  }
})

export default injectIntl(SearchFilter)
