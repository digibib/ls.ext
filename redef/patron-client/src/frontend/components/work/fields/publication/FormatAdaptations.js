import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const FormatAdaptations = ({ formatAdaptations, intl }) => {
  if (formatAdaptations.length > 0) {
    return (
      <MetaItem label={messages.labelFormatAdaptations} data-automation-id="publication_formatAdaptations">
        {formatAdaptations.map(formatAdaptation => intl.formatMessage({ id: formatAdaptation })).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

FormatAdaptations.defaultProps = {
  formatAdaptations: []
}

FormatAdaptations.propTypes = {
  formatAdaptations: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelFormatAdaptations: {
    id: 'FormatAdaptations.labelFormatAdaptations',
    description: 'Label for format adaptations meta',
    defaultMessage: 'Adaptation'
  }
})

export default injectIntl(FormatAdaptations)
