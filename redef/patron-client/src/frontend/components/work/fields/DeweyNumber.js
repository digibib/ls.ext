import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const DeweyNumber = ({ deweyNumber }) => {
  if (deweyNumber) {
    return (
      <MetaItem label={messages.labelDeweyNumber} data-automation-id="work_deweyNumber">
        <br />
        {deweyNumber}
      </MetaItem>
    )
  } else {
    return null
  }
}

DeweyNumber.propTypes = {
  deweyNumber: PropTypes.string
}

export const messages = defineMessages({
  labelDeweyNumber: {
    id: 'DeweyNumber.labelDeweyNumber',
    description: 'Label for dewey number meta',
    defaultMessage: 'Deweyno.'
  }
})

export default DeweyNumber
