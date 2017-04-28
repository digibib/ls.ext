import React, { PropTypes } from 'react'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'
import Constants from '../constants/Constants'
import Item from './Item'

class ItemsMedia extends React.Component {
  constructor (props) {
    super(props)
    this.handleBranchStatusMedia = this.handleBranchStatusMedia.bind(this)
    this.handleBranchStatusMediaEnter = this.handleBranchStatusMediaEnter.bind(this)
    this.mergeItems = this.mergeItems.bind(this)
  }

  componentWillMount () {
    const mediaType = this.props.itemsByMedia.mediaTypeURI
    const branchCode = this.props.branchCode
    this.handleBranchStatusMediaInit(`${branchCode}_${this.splitMediaType(mediaType)}`)
  }

  render () {
    const mediaType = this.props.itemsByMedia.mediaTypeURI
    const branchCode = this.props.branchCode
    const intl = this.props.intl
    const mergedItems = this.mergeItems()
    return (
      <div data-automation-id="work_items">
        <div className="flex-wrapper media-header">
          <div className="flex-item">
            <i className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ mediaType ] ]} />
            {mediaType ? intl.formatMessage({ id: mediaType }) : ''}
          </div>
          <div className="flex-item item-icon-button">
            <button
              onClick={this.handleBranchStatusMedia}
              onKeyDown={this.handleBranchStatusMediaEnter}>
              {this.shouldShowBranchStatusMedia(`${branchCode}_${this.splitMediaType(mediaType)}`)
                ? [(<span key={`show-less-content-media${branchCode}`} className="is-vishidden">
                        <FormattedMessage {...messages.showBranchAvailabilityMedia} />
                      </span>), (<i key={`show-less-content-media-icon${branchCode}`} className="icon-minus" aria-hidden="true" />)]
                : [(<span key={`show-more-content-media${branchCode}`} className="is-vishidden">
                      <FormattedMessage {...messages.hideBranchAvailabilityMedia} />
                      </span>), (<i key={`show-more-content-media-icon${branchCode}`} className="icon-plus" aria-hidden="true" />)]
              }
            </button>
          </div>
        </div>

        {this.shouldShowBranchStatusMedia(`${branchCode}_${this.splitMediaType(mediaType)}`)
        ? (<div className="media-type-items">
            <div className="header">
              <div role="row" className="flex-wrapper">
              <div role="columnheader" className="flex-item"><FormattedMessage {...messages.language} /></div>
              <div role="columnheader" className="flex-item"><FormattedMessage {...messages.placement} /></div>
              <div role="columnheader" className="flex-item"><FormattedMessage {...messages.status} /></div>
              </div>
            </div>
            {mergedItems.map((item, i) => {
              return <Item key={i} item={item} />
            })
            }
            </div>)
          : null
        }
      </div>
    )
  }

  // Merge book items which have the same shelf mark
  mergeItems () {
    if (!this.props.itemsByMedia.items && this.props.itemsByMedia.items.length === 0) {
      return
    }
    // Deep copy original items array
    const itemsCopy = JSON.parse(JSON.stringify(this.props.itemsByMedia.items))
    const merged = []
    itemsCopy.forEach(el => {
      let wasMerged = false
      if (merged.length === 0) {
        merged.push(el)
      }
      merged.forEach(i => {
        if (i.shelfmark === el.shelfmark) {
          wasMerged = true
          if (i.barcode !== el.barcode) {
            i.total = i.total + el.total
            i.available = i.available + el.available
            /*
              const loc = i.location
              i.location = []
              i.location.push(loc)
              if (el.location.length && el.location.toLowerCase() !== loc.toLowerCase()) {
                i.location.push(el.location)
              }
            */
          }
        }
      })
      if (!wasMerged) {
        merged.push(el)
      }
    })
    return merged
  }

  handleBranchStatusMedia () {
    const mediaType = this.props.itemsByMedia.mediaTypeURI
    const branchCode = this.props.branchCode
    this.props.showBranchStatusMedia(`${branchCode}_${this.splitMediaType(mediaType)}`)
  }

  handleBranchStatusMediaInit () {
    const mediaType = this.props.itemsByMedia.mediaTypeURI
    const branchCode = this.props.branchCode
    const { locationQuery: { showBranchStatusMedia } } = this.props
    const code = `${branchCode}_${this.splitMediaType(mediaType)}`
    if (showBranchStatusMedia && showBranchStatusMedia === code || (Array.isArray(showBranchStatusMedia) && showBranchStatusMedia.includes(code))) {
      return
    } else {
      this.props.showBranchStatusMedia(code)
    }
  }

  handleBranchStatusMediaEnter (event) {
    if (event.keyCode === 32) { // Space code
      event.preventDefault()
      this.handleBranchStatusMedia()
    }
  }

  shouldShowBranchStatusMedia (code) {
    const { locationQuery: { showBranchStatusMedia } } = this.props
    return (showBranchStatusMedia && showBranchStatusMedia === code || (Array.isArray(showBranchStatusMedia) && showBranchStatusMedia.includes(code)))
  }

  splitMediaType (code) {
    return code.split('mediaType').pop()
  }
}

ItemsMedia.propTypes = {
  mediaType: PropTypes.string,
  branchCode: PropTypes.string.isRequired,
  intl: PropTypes.object.isRequired,
  itemsByMedia: PropTypes.object.isRequired,
  showBranchStatusMedia: PropTypes.func.isRequired,
  locationQuery: PropTypes.object.isRequired
}

export const messages = defineMessages({
  language: {
    id: 'ItemsMedia.language',
    description: 'Language of item',
    defaultMessage: 'language'
  },
  placement: {
    id: 'ItemsMedia.placement',
    description: 'Placement of item',
    defaultMessage: 'placement'
  },
  status: {
    id: 'ItemsMedia.status',
    description: 'Status of item',
    defaultMessage: 'status'
  },
  showBranchAvailabilityMedia: {
    id: 'ItemsMedia.showBranchAvailabilityMedia',
    description: 'Items availability for media button, text shown for screen readers only',
    defaultMessage: 'Show items grouped by media'
  },
  hideBranchAvailabilityMedia: {
    id: 'ItemsMedia.hideBranchAvailabilityMedia',
    description: 'Items availability for media button, text shown for screen readers only',
    defaultMessage: 'Hide items grouped by media'
  }
})

export default injectIntl(ItemsMedia)
