import PropTypes from 'prop-types'
import React from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import { defineMessages, FormattedMessage } from 'react-intl'

import constants from '../constants/Constants'
import ItemsMedia from './ItemsMedia'

class Items extends React.Component {
  renderEmpty () {
    return <p><span data-automation-id="no_items"><FormattedMessage {...messages.noItems} /></span></p>
  }
  renderItems () {
    /* Sort languages alphabetically */
    const itemsMediaLanSorted = this.props.mediaItems.map(item => {
      item.items.sort((a, b) => {
        if (a.languages[0] < b.languages[0]) return -1
        if (a.languages[0] > b.languages[0]) return 1
        return 0
      })

      const itemToSort = item

      /* Place the preferred languages defined in Constants on top */
      if (item.items.length > 1) {
        item.items.forEach((a, i) => {
          constants.preferredLanguages.reverse().forEach((l) => {
            if (a.languages[ 0 ].includes(l.substr(l.lastIndexOf('/') + 1))) {
              const priLan = itemToSort.items.splice(i, 1)
              itemToSort.items.unshift(priLan[0])
            }
          })
        })
      }
      return itemToSort
    })

    const itemsMedia = itemsMediaLanSorted.map((item, i) => {
      return (
        <ItemsMedia key={i}
                    itemsByMedia={item}
                    branchCode={this.props.branchCode}
                    showBranchStatusMedia={this.props.showBranchStatusMedia}
                    locationQuery={this.props.locationQuery}
        />
      )
    })

    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="items-container">
        {itemsMedia}
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
