import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const CompositionTypes = ({ compositionTypes }) => {
  if (compositionTypes.length > 0) {
    return (
      <MetaItem content={compositionTypes.join(', ')} label={messages.labelCompositionTypes} data-automation-id="work_compositionTypes" />
    )
  } else {
    return null
  }
}

CompositionTypes.defaultProps = {
  compositionTypes: []
}

CompositionTypes.propTypes = {
  compositionTypes: PropTypes.array.isRequired
}

export const messages = defineMessages({
  labelCompositionTypes: {
    id: 'CompositionTypes.labelCompositionTypes',
    description: 'Label for the composition types',
    defaultMessage: 'Composition types'
  }
})

export default CompositionTypes
