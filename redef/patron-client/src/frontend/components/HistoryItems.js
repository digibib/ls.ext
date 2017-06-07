import React, { PropTypes } from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import { defineMessages, FormattedMessage } from 'react-intl'

import HistoryItem from './HistoryItem'

class HistoryItems extends React.Component {
  render () {
    console.log('HISTORY PROPS', this.props)
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="reserve">
        <h1><FormattedMessage {...messages.history} /></h1>
        {
          this.props.historyItems.map((el, i) => <HistoryItem key={i} historyItem={el} />)
        }
      </NonIETransitionGroup>
    )
  }
}

export const messages = defineMessages({
  history: {
    id: 'History.history',
    description: 'The label of history title',
    defaultMessage: 'History'
  }
})

export default HistoryItems