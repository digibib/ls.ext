import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const ContentAdaptations = ({ contentAdaptations, intl }) => {
  if (contentAdaptations.length > 0) {
    return (
      <MetaItem label={messages.labelContentAdaptations} data-automation-id="work_contentAdaptations">
        <br />
        {contentAdaptations.map(contentAdaptation => intl.formatMessage({ id: contentAdaptation })).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

ContentAdaptations.defaultProps = {
  contentAdaptations: []
}

ContentAdaptations.propTypes = {
  contentAdaptations: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelContentAdaptations: {
    id: 'ContentAdaptations.labelContentAdaptations',
    description: 'Label for contentAdaptations',
    defaultMessage: 'Adaptations'
  }
})

export default injectIntl(ContentAdaptations)
