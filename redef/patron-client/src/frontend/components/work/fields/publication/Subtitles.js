import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Subtitles = ({ subtitles, intl }) => {
  if (subtitles.length > 0) {
    return (
      <MetaItem label={messages.labelSubtitles} data-automation-id="publication_subtitles">
        {subtitles.map(subtitle => intl.formatMessage({ id: subtitle })).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

Subtitles.defaultProps = {
  subtitles: []
}

Subtitles.propTypes = {
  subtitles: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelSubtitles: {
    id: 'Subtitles.labelSubtitles',
    description: 'Label for subtitles meta',
    defaultMessage: 'Subtitles'
  }
})

export default injectIntl(Subtitles)
