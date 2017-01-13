import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import React, {PropTypes} from 'react'
import * as ResourceActions from '../actions/ResourceActions'
import {defineMessages, injectIntl, intlShape} from 'react-intl'

class Sorter extends React.Component {

  render () {
    const swapSortOrder = function (order) {
      if (order === 'desc') {
        return 'asc'
      }
      if (order === 'asc') {
        return 'desc'
      }
      return 'asc'
    }
    const { sortOrder, selectTab, sortParameter, sortColumn, intl } = this.props

    const handleReverseSortOrder = function () {
      selectTab(sortParameter, `${sortColumn}.${swapSortOrder(sortOrder)}`, true)
    }
    return (
      <button className="sorter" onClick={handleReverseSortOrder}
              title={intl.formatMessage(messages[ swapSortOrder(sortOrder) ])} >
        <span className={`sort-button icon-up-open ${((!sortOrder || sortOrder === 'asc') ? 'visible' : '')}`} />
        <span className={`sort-button icon-down-open ${((!sortOrder || sortOrder === 'desc') ? 'visible' : '')}`} />
      </button>
    )
  }
}

export const messages = defineMessages({
  asc: {
    id: 'Sorting.sort.asc', description: 'Sort ascending', defaultMessage: 'Sort ascending'
  },
  desc: {
    id: 'Sorting.sort.desc', description: 'Sort descending', defaultMessage: 'Sort descending'
  }
})

Sorter.propTypes = {
  sortOrder: PropTypes.string,
  sortColumn: PropTypes.string,
  sortParameter: PropTypes.string,
  selectTab: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

function mapDispatchToProps (dispatch) {
  return {
    selectTab: bindActionCreators(ResourceActions.updateUrlQueryValue, dispatch)
  }
}

export default connect(
  null,
  mapDispatchToProps
)(injectIntl(Sorter))
