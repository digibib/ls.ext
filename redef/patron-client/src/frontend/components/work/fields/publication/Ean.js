import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Ean = ({ ean }) => {
  if (ean) {
    return (
      <MetaItem label={messages.ean} data-automation-id="publication_ean">{ean}</MetaItem>
    )
  } else {
    return null
  }
}

Ean.propTypes = {
  ean: PropTypes.string
}

export const messages = defineMessages({
  ean: {
    id: 'Ean.ean',
    description: 'Label for ean meta',
    defaultMessage: 'EAN'
  }
})

export default Ean
