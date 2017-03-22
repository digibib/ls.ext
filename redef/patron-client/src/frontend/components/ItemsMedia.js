import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import Constants from '../constants/Constants'
import Item from './Item'

class ItemsMedia extends React.Component {
  render () {
    const mediaType = this.props.itemsByMedia.mediaTypeURI
    const intl = this.props.intl
    return (
      <div role="row" data-automation-id="work_items" className="flex-wrapper">
        <div role="gridcell" className="flex-item main-row-1">
          <i className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ mediaType ] ]} />
          {mediaType ? intl.formatMessage({ id: mediaType }) : ''}</div>
        <div role="gridcell" className="flex-item main-row-2">
          {this.props.itemsByMedia.items.map((item, i) => {
            return <Item key={i} item={item} />
          })
          }
          </div>
      </div>
    )
  }
}

export default injectIntl(ItemsMedia)