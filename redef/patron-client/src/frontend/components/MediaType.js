import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'
import Constants from '../constants/Constants'

class MediaType extends React.Component {
  renderFormats (mediaType, maybeFormats) {
    const formats = maybeFormats || []
    const filtered = formats.filter(format => {
      if (mediaType === 'http://data.deichman.no/mediaType#Book' && (formats.length === 1 && formats[ 0 ] === 'http://data.deichman.no/format#Book')) {
        return false
      } else {
        return !(mediaType === 'http://data.deichman.no/mediaType#ComicBook' && (formats.length === 1 && formats[ 0 ] === 'http://data.deichman.no/format#Book'))
      }
    })
    return <ul className="mediaTypeFormats">
      {filtered.map(format => {
        return <li aria-labelledby={this.props.intl.formatMessage({ id: mediaType })} key={format}>{this.props.intl.formatMessage({ id: format })} &nbsp;</li>
      })}
    </ul>
  }

  render () {
    const mediaType = this.props.mediaType
    const role = this.props.buttonRole
    const tabIndex = this.props.buttonTabIndex
    const icon = Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ mediaType.uri ] ] || 'images/book24.svg'
    return (
      <div role={role} key={mediaType.uri} className="entry-content-icon-single" tabIndex={tabIndex}>
        <img className="icon" src={icon} />
        {this.props.intl.formatMessage({ id: mediaType.uri })}
        {this.renderFormats(mediaType.uri, mediaType.formats)}
      </div>
    )
  }
}

MediaType.propTypes = {
  mediaType: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  buttonRole: PropTypes.string,
  buttonTabIndex: PropTypes.string
}

export default injectIntl(MediaType)
