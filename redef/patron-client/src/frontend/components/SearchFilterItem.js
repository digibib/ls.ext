import React, {PropTypes} from 'react'
import {injectIntl, intlShape} from 'react-intl'

class SearchFilterItem extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  handleClick (event) {
    event.preventDefault()
    const { filter: { id } } = this.props
    this.props.toggleFilter(id)
  }

  handleKey (event) {
    if (event.keyCode === 32) { // Space for checkbox
      event.preventDefault()
      this.handleClick(event)
    }
  }

  render () {
    const { filter } = this.props
    const id = `filter_${filter.id}`
    return (
      <li data-automation-id={id}>
        <input type="checkbox" id={id} name="filter" checked={filter.active} onChange={this.handleClick} aria-hidden="true" />
        <label htmlFor={id} onKeyDown={this.handleKey}>
          <div className="checkbox-wrapper">
            <i
              role="checkbox"
              aria-checked="false"
              aria-label={this.props.intl.formatMessage({ id: filter.bucket })}
              className="icon-check-empty checkbox-unchecked"
              tabIndex="0"
            />
            <i
              role="checkbox"
              aria-checked="true"
              aria-label={this.props.intl.formatMessage({ id: filter.bucket })}
              className="icon-ok-squared checkbox-checked"
              tabIndex="0"
            />
          </div>
          <h2 className="filter_label" data-automation-id="filter_label" data-checked={filter.active} aria-hidden="true">
            {this.props.intl.formatMessage({ id: filter.bucket })}{/* <span className="filter_count">({filter.count})</span> */}
          </h2>
        </label>
      </li>
    )
  }
}

SearchFilterItem.propTypes = {
  filter: PropTypes.object.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  scrollTargetNode: PropTypes.object.isRequired,
  toggleAllFilters: PropTypes.func
}

export default injectIntl(SearchFilterItem)
