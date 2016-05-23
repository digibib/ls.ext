import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'

class SearchFilterItem extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    const { filter: { id } } = this.props
    this.props.toggleFilter(id)
  }

  render () {
    const { filter } = this.props
    // TODO: Put back count when number is fixed
    return (
      <li onClick={this.handleClick}
          data-automation-id={`filter_${filter.id}`}>
        <input type='checkbox' readOnly checked={filter.active} />
        <label htmlFor='checkbox'>Checkbox</label>
        <h2 className='filter_label'
            data-automation-id='filter_label'>{this.props.intl.formatMessage({ id: filter.bucket })}</h2>{/* (
       <span data-automation-id='filter_count'>{filter.count}</span>) */}
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
