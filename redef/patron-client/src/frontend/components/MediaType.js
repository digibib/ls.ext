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
    return <p>
      {filtered.map(format => {
        return <span key={format}>{this.props.intl.formatMessage({ id: format })} &nbsp;</span>
      })}
    </p>
  }

  render () {
    const mediaType = this.props.mediaType
    return (
      <div key={mediaType.uri} className="entry-content-icon-single">
        <i className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ mediaType.uri ] ]} />
        {this.props.intl.formatMessage({ id: mediaType.uri })}
        {/* Im unsure if this is needed, leaving it commented out for now. It renders an empty <p> for me */}
        {/* <div>{this.renderFormats(mediaType.uri, mediaType.formats)}</div> */}
      </div>
    )
  }
}

MediaType.propTypes = {
  mediaType: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(MediaType)
