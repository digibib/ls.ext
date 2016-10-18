import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const TargetAudience = ({ audiences, intl }) => {
  if (audiences.length > 0) {
    return (
      <MetaItem label={messages.labelTargetAudience}
                content={audiences.map(audience => intl.formatMessage({ id: audience })).join(', ')}
                data-automation-id="work_audiences"
      />
    )
  } else {
    return null
  }
}

TargetAudience.defaultProps = {
  audiences: []
}

TargetAudience.propTypes = {
  audiences: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelTargetAudience: {
    id: 'TargetAudience.labelTargetAudience',
    description: 'Label for target audience',
    defaultMessage: 'Target audience'
  }
})

export default injectIntl(TargetAudience)
