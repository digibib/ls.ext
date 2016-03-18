import React, { PropTypes } from 'react'
import Constants from '../constants/Constants'

export default React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    aggregation: PropTypes.string.isRequired,
    filters: PropTypes.array,
    locationQuery: PropTypes.object.isRequired,
    setFilter: PropTypes.func.isRequired
  },
  contextTypes: {
    router: React.PropTypes.object
  },
  getInitialState () {
    return {
      filters: [],
      showAll: false
    }
  },
  handleShowAllClick () {
    this.setState({ showAll: !this.state.showAll })
  },
  renderEmpty () {
    return <div data-automation-id='empty'></div>
  },
  renderFilters () {
    let filters = this.props.filters.slice()
    filters.sort(function (a, b) {
      return (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)
    }).map(filter => { return { ...filter } })
    return filters.map((filter, index) => {
      if (!this.state.showAll && index >= Constants.maxVisibleFilterItems) {
        return ''
      }

      let aggregationFilter = this.props.locationQuery[ 'filter_' + filter.aggregation ]
      if (aggregationFilter instanceof Array) {
        filter.active = aggregationFilter.indexOf(filter.bucket) > -1
      } else {
        filter.active = aggregationFilter === filter.bucket
      }

      return (
        <li key={filter.aggregation + '_' + filter.bucket} onClick={this.handleClick.bind(this, filter)}
            data-automation-id={'filter_' + filter.aggregation + '_' + filter.bucket}>
          <input type='checkbox' readOnly checked={filter.active}/>
          {filter.bucket} (
          {filter.count})
        </li>
      )
    })
  },
  handleClick (filter) {
    filter.active = !filter.active
    this.props.setFilter(filter, this.context.router)
  },
  render () {
    if (!this.props.filters || this.props.filters.size === 0) {
      return this.renderEmpty()
    }
    return (
      <div data-automation-id={`filter_${this.props.aggregation}`}>
        <h4 className='filterTitle'>{this.props.title}</h4>
        <ul className='searchfilters'>
          {this.renderFilters()}
          {(this.state.showAll || this.props.filters.length <= Constants.maxVisibleFilterItems) ? '' : (
            <li onClick={this.handleShowAllClick}>
              <FormattedMessage {...messages.showAll} /><br/>
            </li>
          )}
        </ul>
      </div>
    )
  }
})

const messages = defineMessages({
  showAll: {
    id: 'SearchFilter.showAll',
    description: 'Show all filters for a group',
    defaultMessage: '+ show all'
  }
})
