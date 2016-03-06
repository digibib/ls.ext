import React, { PropTypes } from 'react'
import { push } from 'react-router-redux'
import Constants from '../constants/Constants'

export default React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    filters: PropTypes.array,
    locationQuery: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
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
    })
    return filters.map((filter, index) => {
      if (!this.state.showAll && index >= Constants.maxVisibleFilterItems) {
        return ''
      }

      let aggregationFilter = this.props.locationQuery[ 'filter_' + filter.aggregation ]
      let checked
      if (aggregationFilter instanceof Array) {
        checked = aggregationFilter.indexOf(filter.bucket) > -1
      } else {
        checked = aggregationFilter === filter.bucket
      }

      return (
        <p key={filter.aggregation + '_' + filter.bucket}
           data-automation-id={'filter_' + filter.aggregation + '_' + filter.bucket}>
          <input type='checkbox' checked={checked} onChange={this.handleChange.bind(this, filter)}/>
          {filter.bucket} (
          {filter.count})
        </p>
      )
    })
  },
  handleChange (filter, event) {
    filter.active = event.target.checked

    let queryParamName = 'filter_' + filter.aggregation
    let locationQuery = this.props.locationQuery

    let queryParam = locationQuery[ queryParamName ]
    if (filter.active) {
      if (queryParam && Array.isArray(queryParam)) {
        if (queryParam.indexOf(filter.bucket) === -1) {
          queryParam.push(filter.bucket)
        }
      } else if (queryParam && queryParam !== filter.bucket) {
        locationQuery[ queryParamName ] = [ queryParam, filter.bucket ]
      } else {
        locationQuery[ queryParamName ] = filter.bucket
      }
    } else {
      if (queryParam && Array.isArray(queryParam)) {
        if (queryParam.indexOf(filter.bucket) >= 0) {
          queryParam.splice(queryParam.indexOf(filter.bucket), 1)
        }
      } else if (queryParam === filter.bucket) {
        delete locationQuery[ queryParamName ]
      }
    }
    delete locationQuery[ 'page' ]
    let url = this.context.router.createPath({ pathname: '/search', query: locationQuery })
    this.props.dispatch(push(url))
  },
  render () {
    if (!this.props.filters || this.props.filters.size === 0) {
      return this.renderEmpty()
    }
    return (
      <div>
        <h4>{this.props.title}</h4>
        {this.renderFilters()}
        {(this.state.showAll || this.props.filters.length <= Constants.maxVisibleFilterItems) ? '' : (
          <p onClick={this.handleShowAllClick}>
            + vis alle
          </p>
        )}
      </div>
    )
  }
})
