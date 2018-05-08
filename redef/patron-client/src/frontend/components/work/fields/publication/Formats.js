import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Formats = ({ formats, intl }) => {
  if (formats.length > 0) {
    return (
      <MetaItem label={messages.labelFormats} data-automation-id="publication_formats">
        {formats.map(format => intl.formatMessage({ id: format })).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

Formats.defaultProps = {
  formats: []
}

Formats.propTypes = {
  formats: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelFormats: {
    id: 'Formats.labelFormats',
    description: 'Label for formats meta',
    defaultMessage: 'Formats'
  }
})

export default injectIntl(Formats)
