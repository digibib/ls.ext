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
        <input type='checkbox'  id='filter' name='filter' readOnly checked={filter.active} />
        <label for='filter'><span></span><h2 className='filter_label'
                                             data-automation-id='filter_label'>{this.props.intl.formatMessage({ id: filter.bucket })}</h2></label>

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
