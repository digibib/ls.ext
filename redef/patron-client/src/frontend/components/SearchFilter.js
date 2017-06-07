import React, {PropTypes} from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import ReactDOM from 'react-dom'
import Constants from '../constants/Constants'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'

import SearchFilterItem from './SearchFilterItem'

class SearchFilter extends React.Component {
  constructor (props) {
    super(props)
    this.handleCollapse = this.handleCollapse.bind(this)
    this.handleShowAllClick = this.handleShowAllClick.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  handleShowAllClick () {
    this.props.toggleFilterVisibility(this.props.aggregation)
    ReactDOM.findDOMNode(this).scrollIntoView()
  }

  handleKey (event) {
    if (event.keyCode === 32) { // Space for button
      event.preventDefault()
      this.handleShowAllClick()
    }
  }

  renderEmpty () {
    return <div data-automation-id="empty" />
  }

  shouldShowMore () {
    const { aggregation, locationQuery: { showMore } } = this.props
    return (showMore && showMore === aggregation || (Array.isArray(showMore) && showMore.includes(aggregation)))
  }

  isCollapsed () {
    const { aggregation, locationQuery: { showFilter } } = this.props
    return !(showFilter && showFilter === aggregation || (Array.isArray(showFilter) && showFilter.includes(aggregation)))
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
        if (!filter.bucket || filter.bucket === '') {
          return
        }
        return (
          <SearchFilterItem key={filter.id}
                            filter={filter}
                            toggleAllFilters={this.props.toggleAllFilters}
                            toggleFilter={this.props.toggleFilter}
                            scrollTargetNode={this.props.scrollTargetNode} />
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
      <div className="show-more" onClick={this.handleShowAllClick} onKeyDown={this.handleKey}>
        <h3>{this.shouldShowMore() || this.props.filters.length <= Constants.maxVisibleFilterItems
          ? <a role="button" tabIndex="0" aria-expanded="true"><FormattedMessage {...messages.showLess} /></a>
          : <a role="button" tabIndex="0" aria-expanded="false"><FormattedMessage {...messages.showMore} /></a>}</h3>
      </div>
    )
  }

  render () {
    if (!this.props.filters || this.props.filters.size === 0) {
      return this.renderEmpty()
    }
    const buttonAriaLabel = (this.isCollapsed())
      ? `${this.props.intl.formatMessage(messages.expandGroup)} ${this.renderTitle()}`
      : `${this.props.intl.formatMessage(messages.collapseGroup)} ${this.renderTitle()}`
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className={this.props.first ? 'filter-group-first' : 'filter-group'}
        data-automation-id={`filter_${this.props.aggregation}`}>
        <header className="filterTitle" onClick={this.handleCollapse}>
          <h1>{this.renderTitle()}</h1>
          <button className="single-filter-close" type="button"
                  aria-label={buttonAriaLabel} aria-expanded={!this.isCollapsed()}>
            {this.isCollapsed()
              ? <i className="icon-plus" aria-hidden />
              : <i className="icon-minus" aria-hidden />}
          </button>
        </header>
        {this.isCollapsed() ? null
          : [ <section className="filter-list" key="searchfilter_header">
          <ul className="searchfilters">{this.renderFilters()}</ul>
        </section>, <footer key="searchfilter_footer">{this.renderShowMore()}</footer> ]}
      </NonIETransitionGroup>
    )
  }
}

SearchFilter.propTypes = {
  aggregation: PropTypes.string.isRequired,
  filters: PropTypes.array,
  toggleFilter: PropTypes.func.isRequired,
  toggleFilterVisibility: PropTypes.func.isRequired,
  toggleCollapseFilter: PropTypes.func.isRequired,
  toggleAllFilters: PropTypes.func,
  locationQuery: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  scrollTargetNode: PropTypes.object.isRequired,
  first: PropTypes.bool
}

export const messages = defineMessages({
  expandGroup: {
    id: 'SearchFilter.expandGroup',
    description: 'Aria label for expanding the filter group',
    defaultMessage: 'Expand filtergroup:'
  },
  collapseGroup: {
    id: 'SearchFilter.collapseGroup',
    description: 'Aria label for collapsing the filter group',
    defaultMessage: 'Collapse filtergroup:'
  },
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
  fictionNonfiction: {
    id: 'SearchFilter.filter[work.fictionNonfiction]',
    description: 'Label of the fictionNonFiction filter',
    defaultMessage: 'Fiction/nonfiction'
  },
  mediatype: {
    id: 'SearchFilter.filter[work.publications.mediatype]',
    description: 'Label of the mediatype filter',
    defaultMessage: 'Mediatype'
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
    id: 'SearchFilter.filter[work.audiences]',
    description: 'Label of the audience filter',
    defaultMessage: 'Audience'
  },
  branch: {
    id: 'SearchFilter.filter[work.publications.branches]',
    description: 'Label of the branches filter',
    defaultMessage: 'Choose department'
  }
})

export default injectIntl(SearchFilter)
