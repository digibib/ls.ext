import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { defineMessages, FormattedMessage } from 'react-intl'

import NonIETransitionGroup from '../components/NonIETransitionGroup'
import SearchFilters from '../components/SearchFilters'
import DataRangeFilter from '../components/DateRangeFilter'
import Constants from '../constants/Constants'

class SearchFiltersContainer extends React.Component {
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
    console.log(this.props)
    const buttonClass = (this.props.locationQuery.hideFilters === Constants.enabledParameter) ? 'filters-hidden' : 'filters-visible'
    if (this.props.locationQuery.query && this.props.filters) {
      return (
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="aside"
          className="filters">

          <div className="filters-generic">
          <div className="limit-filters">
            <Link className={buttonClass} to="#" onClick={this.handleFiltersOpenClick}>
              {this.props.locationQuery.hideFilters === Constants.enabledParameter
                ? (<span>Vis filter</span>)
                : (<span>Skjul filter</span>)}
            </Link>
          </div>


          <header className="limit-filters-header">
            <FormattedMessage {...messages.limit} />
          </header>

          <SearchFilters {...this.props} />
          <DataRangeFilter />


        </div>
        </NonIETransitionGroup>
      )
    } else {
      return this.renderEmpty()
    }
  }
}

export const messages = defineMessages({
  limit: {
    id: 'SearchFilters.limit',
    description: 'The header of the filter groups',
    defaultMessage: 'Limit your search'
  }
})

export default SearchFiltersContainer