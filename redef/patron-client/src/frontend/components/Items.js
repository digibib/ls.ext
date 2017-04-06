import React, { PropTypes } from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import { defineMessages, FormattedMessage } from 'react-intl'

import ItemsMedia from './ItemsMedia'

class Items extends React.Component {
  renderEmpty () {
    return <p><span data-automation-id="no_items"><FormattedMessage {...messages.noItems} /></span></p>
  }
  renderItems () {
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="items-container">
          {this.props.mediaItems.map((items, i) => {
            return <ItemsMedia key={i}
                               itemsByMedia={items}
                               branchCode={this.props.branchCode}
                               showBranchStatusMedia={this.props.showBranchStatusMedia}
                               locationQuery={this.props.locationQuery}
                               itemLocation={i}
            />
          })
          }
      </NonIETransitionGroup>
    )
  }
  render () {
    return this.props.mediaItems.length > 0
      ? this.renderItems()
      : this.renderEmpty()
  }
}

Items.propTypes = {
  mediaItems: PropTypes.array.isRequired,
  locationQuery: PropTypes.object.isRequired,
  branchCode: PropTypes.string.isRequired,
  showBranchStatusMedia: PropTypes.func.isRequired,
  userBranch: PropTypes.string,
  activeFilters: PropTypes.array.isRequired
}

export const messages = defineMessages({
  count: {
    id: 'Items.count', description: 'Count of item', defaultMessage: 'count'
  },
  title: {
    id: 'Items.title', description: 'Title of item', defaultMessage: 'title'
  },
  language: {
    id: 'Items.language', description: 'Language of item', defaultMessage: 'language'
  },
  format: {
    id: 'Items.format', description: 'Format of item', defaultMessage: 'format'
  },
  barcode: {
    id: 'Items.barcode', description: 'Barcode of item', defaultMessage: 'barcode'
  },
  placement: {
    id: 'Items.placement', description: 'Placement of item', defaultMessage: 'placement'
  },
  status: {
    id: 'Items.status', description: 'Status of item', defaultMessage: 'status'
  },
  shelfmark: {
    id: 'Items.shelfmark', description: 'Shelfmark of item', defaultMessage: 'shelfmark'
  },
  noItems: {
    id: 'Items.noItems', description: 'When no items', defaultMessage: 'We have no copies'
  },
  numberOfCopies: {
    id: 'Items.numberOfCopies', description: 'The number of copies', defaultMessage: 'Copies ({numberOfCopies})'
  },
  mediaType: {
    id: 'Items.mediaType', description: 'MediaType of item', defaultMessage: 'type'
  }
})

export default Items
