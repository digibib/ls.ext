import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Extent = ({ extent }) => {
  if (extent) {
    return (
      <MetaItem label={messages.extent} data-automation-id="publication_extent">{extent}</MetaItem>
    )
  } else {
    return null
  }
}

Extent.propTypes = {
  extent: PropTypes.string
}

export const messages = defineMessages({
  extent: {
    id: 'Extent.extent',
    description: 'Label for extent meta',
    defaultMessage: 'Extent'
  }
})

export default Extent
