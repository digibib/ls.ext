import React, { PropTypes } from 'react'
import Constants from '../constants/Constants'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

const SearchFilter = React.createClass({
  propTypes: {
    aggregation: PropTypes.string.isRequired,
    filters: PropTypes.array,
    setFilter: PropTypes.func.isRequired,
    intl: intlShape.isRequired
  },
  contextTypes: {
    router: React.PropTypes.object
  },
  handleShowAllClick () {
    this.props.setFiltersVisibility(this.props.aggregation, this.context.router)
  },
  renderEmpty () {
    return <div data-automation-id='empty'></div>
  },
  shouldShowMore () {
    let { showMore } = this.props.locationQuery
    let { aggregation } = this.props
    return (showMore && showMore === aggregation || (Array.isArray(showMore) && showMore.includes(aggregation)))
  },
  renderFilters () {
    return [ ...this.props.filters ].sort((a, b) => (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0))
      .map((filter, index) => {
        if (!this.shouldShowMore() && index >= Constants.maxVisibleFilterItems) {
          return ''
        }
        return (
          <li key={filter.aggregation + '_' + filter.bucket} onClick={this.handleClick.bind(this, filter)}
              data-automation-id={'filter_' + filter.aggregation + '_' + filter.bucket}>
            <input type='checkbox' readOnly checked={filter.active}/>
            <label for='checkbox'>Checkbox</label>
            <h2 className="filter_label"
                data-automation-id='filter_label'>{this.props.intl.formatMessage({ id: filter.bucket })}</h2>
            (
            <span data-automation-id='filter_count'>{filter.count}</span>)
          </li>
        )
      })
  },
  renderTitle () {
    return messages[ this.props.aggregation ]
      ? this.props.intl.formatMessage({ ...messages[ this.props.aggregation ] })
      : this.props.aggregation
  },
  handleClick (filter) {
    this.props.setFilter(filter.aggregation, filter.bucket, !filter.active, this.context.router)
  },
  render () {
    if (!this.props.filters || this.props.filters.size === 0) {
      return this.renderEmpty()
    }
    return (
      <div data-automation-id={`filter_${this.props.aggregation}`}>
        <header className='filterTitle'>
          <h1>{this.renderTitle()}</h1>
          <button className='single-filter-close' type='button'>
            <img src='/images/btn-single-filter-close.svg' alt='Black circle with dash'/>
          </button>

        </header>
        <section>
          <ul className='searchfilters'>
            {this.renderFilters()}
          </ul>
        </section>
        <footer>
          {(this.shouldShowMore() || this.props.filters.length <= Constants.maxVisibleFilterItems)
            ? (<div className='show-more' onClick={this.handleShowAllClick}>
            <h3><FormattedMessage {...messages.showLess} /></h3>
          </div>)
            : (<div className='show-less' onClick={this.handleShowAllClick}>
            <h3><FormattedMessage {...messages.showMore} /></h3>
          </div>)}
        </footer>
      </div>
    )
  }
})

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
  'work.publications.formats': {
    id: 'SearchFilter.filter[work.publications.formats]',
    description: 'Label of the format filter',
    defaultMessage: 'Format'
  },
  'work.publications.languages': {
    id: 'SearchFilter.filter[work.publications.languages]',
    description: 'Label of the language filter',
    defaultMessage: 'Language'
  },
  'work.publications.audiences': {
    id: 'SearchFilter.filter[work.publications.audiences]',
    description: 'Label of the audience filter',
    defaultMessage: 'Audience'
  }
})

export default injectIntl(SearchFilter)
