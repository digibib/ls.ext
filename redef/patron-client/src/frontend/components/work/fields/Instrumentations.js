import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const Instrumentations = ({ instrumentations }) => {
  if (instrumentations.length > 0) {
    return (
      <MetaItem label={messages.labelInstrumentations} data-automation-id="work_Instrumentation">
        {instrumentations.map(instrumentation => `${instrumentation.instrument} (${instrumentation.number})`).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

Instrumentations.defaultProps = {
  instrumentations: []
}

Instrumentations.propTypes = {
  instrumentations: PropTypes.array
}

export const messages = defineMessages({
  labelInstrumentations: {
    id: 'Instrumentations.labelInstrumentations',
    description: 'Label for Instrumentations',
    defaultMessage: 'Instrumentations'
  }
})

export default Instrumentations
