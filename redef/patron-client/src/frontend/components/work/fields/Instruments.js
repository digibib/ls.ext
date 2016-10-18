import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const Instruments = ({ instruments }) => {
  if (instruments.length > 0) {
    return (
      <MetaItem content={instruments.join(', ')} label={messages.labelInstruments} data-automation-id="work_instruments" />
    )
  } else {
    return null
  }
}

Instruments.defaultProps = {
  instruments: []
}

Instruments.propTypes = {
  instruments: PropTypes.array
}

export const messages = defineMessages({
  labelInstruments: {
    id: 'Instruments.labelInstruments',
    description: 'Label for instruments',
    defaultMessage: 'Instruments'
  }
})

export default Instruments
