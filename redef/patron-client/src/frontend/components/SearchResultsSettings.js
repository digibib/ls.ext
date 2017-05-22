import {connect} from 'react-redux'
import React, {PropTypes} from 'react'
import {defineMessages, injectIntl, intlShape} from 'react-intl'

import ClickableElement from '../components/ClickableElement'

class SearchResultsSettings extends React.Component {
  render () {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div>
          <span style={{ display: 'block', fontSize: 11}}>Vis liste som:</span>
          <ClickableElement onClickAction={this.props.searchActions.toggleListView} onClickArguments={'showFullList'}>
            <button type="button"><i className="icon-th" aria-hidden="true" style={{ fontSize: '2em' }}></i></button>
          </ClickableElement>
          <ClickableElement onClickAction={this.props.searchActions.toggleListView} onClickArguments={'showList'}>
            <button type="button"><i className="icon-th-list" aria-hidden="true" style={{ fontSize: '2em' }}></i></button>
          </ClickableElement>
        </div>
      </div>
    )
  }
}

export default connect(
  null,
)(injectIntl(SearchResultsSettings))