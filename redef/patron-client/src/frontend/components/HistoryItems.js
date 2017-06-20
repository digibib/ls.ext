import React, { PropTypes } from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import { defineMessages, FormattedMessage } from 'react-intl'
import InfiniteScroll from 'react-infinite-scroller';

import HistoryItem from './HistoryItem'

class HistoryItems extends React.Component {
  render () {
    const items = this.props.historyItems.map((el, i) => <HistoryItem key={i} historyItem={el} />)
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="history">
        <h1><FormattedMessage {...messages.history} /></h1>
        <InfiniteScroll
          pageStart={0}
          loadMore={this.props.loadItems}
          hasMore={this.props.hasMoreItems}
          threshold={10}
        >
          <div>
            {items}
          </div>
        </InfiniteScroll>
      </NonIETransitionGroup>
    )
  }
}

export const messages = defineMessages({
  history: {
    id: 'History.history',
    description: 'The label of history title',
    defaultMessage: 'My history'
  }
})

export default HistoryItems