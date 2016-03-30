import React, { PropTypes } from 'react'
import Constants from '../constants/Constants'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

let SearchFilter = React.createClass({
  propTypes: {
    title: PropTypes.string.isRequired,
    aggregation: PropTypes.string.isRequired,
    filters: PropTypes.array,
    setFilter: PropTypes.func.isRequired,
    intl: intlShape.isRequired
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
    return [ ...this.props.filters ].sort(function (a, b) {
      return (a.count < b.count) ? 1 : ((b.count < a.count) ? -1 : 0)
    }).map((filter, index) => {
      if (!this.state.showAll && index >= Constants.maxVisibleFilterItems) {
        return ''
      }
      return (
        <li key={filter.aggregation + '_' + filter.bucket} onClick={this.handleClick.bind(this, filter)}
            data-automation-id={'filter_' + filter.aggregation + '_' + filter.bucket}>
          <input type='checkbox' readOnly checked={filter.active}/>
          {this.props.intl.formatMessage({ id: filter.bucket })} ({filter.count})
        </li>
      )
    })
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

export default injectIntl(SearchFilter)
