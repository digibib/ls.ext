import {connect} from 'react-redux'
import React, {PropTypes} from 'react'
import {defineMessages, injectIntl, intlShape} from 'react-intl'


class SearchResultsSettings extends React.Component {
  render () {
    return (
      <div style={{ textAlign: 'right' }}>
        <div>Vis liste som:</div>
        <i className="icon-th" aria-hidden="true"></i>
        <i className="icon-th-list" aria-hidden="true"></i>
      </div>
    )
  }
}

export default connect(
  null,
)(injectIntl(SearchResultsSettings))