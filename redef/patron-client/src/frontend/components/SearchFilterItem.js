import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'

class SearchFilterItem extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event) {
    event.preventDefault()
    const { filter: { id } } = this.props
    this.props.toggleFilter(id)
  }

  render () {
    const { filter } = this.props
    const id = `filter_${filter.id}`
    return (
      <li data-automation-id={id}>
        <input type="checkbox" id={id} name="filter" checked={filter.active} onChange={this.handleClick} />
        <label htmlFor={id}>
          <div className="checkbox-wrapper">
            <i className="icon-check-empty checkbox-unchecked" aria-hidden="true" />
            <i className="icon-ok-squared checkbox-checked" aria-hidden="true" />
          </div>
          <h2 className="filter_label" data-automation-id="filter_label">
            {this.props.intl.formatMessage({ id: filter.bucket })}{/* ({filter.count}) */}
          </h2>
        </label>
      </li>
    )
  }
}

SearchFilterItem.propTypes = {
  filter: PropTypes.object.isRequired,
  toggleFilter: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(SearchFilterItem)
