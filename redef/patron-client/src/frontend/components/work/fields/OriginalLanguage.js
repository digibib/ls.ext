import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const OriginalLanguage = ({ languages, intl }) => {
  if (languages.length > 0) {
    return (
      <MetaItem label={messages.labelOriginalLanguage} data-automation-id="work_originalLanguage">
        {languages.map(language => intl.formatMessage({ id: language })).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

OriginalLanguage.defaultProps = {
  languages: []
}

OriginalLanguage.propTypes = {
  languages: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelOriginalLanguage: {
    id: 'OriginalLanguage.labelOriginalLanguage',
    description: 'Label for original language',
    defaultMessage: 'Original language'
  }
})

export default injectIntl(OriginalLanguage)
