import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const Classifications = ({ classifications }) => {
  if (classifications.length > 0) {
    return (
      <MetaItem label={messages.labelClassifications} data-automation-id="work_classifications">
        <br />
        {classifications.join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

Classifications.defaultProps = {
  classifications: []
}

Classifications.propTypes = {
  classifications: PropTypes.array.isRequired
}

export const messages = defineMessages({
  labelClassifications: {
    id: 'Classifications.labelClassifications',
    description: 'Label for the classifications',
    defaultMessage: 'Classification'
  }
})

export default Classifications
