import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'
import { Link } from 'react-router'
import fieldQueryLink from '../../../../utils/link'

const FormatAdaptations = ({ formatAdaptations, intl }) => {
  if (formatAdaptations.length > 0) {
    return (
      <MetaItem label={messages.labelFormatAdaptations} data-automation-id="publication_formatAdaptations">
        {formatAdaptations.map((formatAdaptation, index) =>
          <span key={formatAdaptation}>
            <Link to={fieldQueryLink('tilpasset', intl.formatMessage({id: formatAdaptation}))}>
              { intl.formatMessage({ id: formatAdaptation }) }
            </Link>
            {index + 1 === formatAdaptations.length ? '' : ', '}
          </span>
        )}
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
