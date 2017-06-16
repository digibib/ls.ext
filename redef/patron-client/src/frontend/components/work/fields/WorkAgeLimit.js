import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import MetaItem from '../../MetaItem'

const WorkAgeLimit = ({ publications, intl }) => {
  const ageLimits = [...new Set(publications.map(p => p.ageLimit).filter(l => l))]
  if (ageLimits.length === 1) {
    return (
      <MetaItem label={messages.ageLimit} data-automation-id="work_ageLimit">
        {ageLimits[0] === '0' ? <FormattedMessage {...messages.noAgeLimit} /> : ageLimits[0]}
      </MetaItem>
    )
  } else if (ageLimits.length > 1) {
    return (
      <MetaItem label={messages.ageLimit} data-automation-id="work_ageLimit">
          <FormattedMessage {...messages.seePublication} />
      </MetaItem>
    )
  } else {
    return null
  }
}

WorkAgeLimit.defaultProps = {
  publications: []
}

WorkAgeLimit.propTypes = {
  publications: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  ageLimit: {
    id: 'AgeLimit.ageLimit',
    description: 'Label for age limit meta',
    defaultMessage: 'Age limit'
  },
  noAgeLimit: {
    id: 'AgeLimit.noAgeLimit',
    description: 'Label for no age limit',
    defaultMessage: 'For all ages'
  },
  seePublication: {
    id: 'WorkAgeLimit.seePublication',
    description: 'Label telling you to look for age limits under publication information',
    defaultMessage: 'See publication'
  }
})

export default injectIntl(WorkAgeLimit)
