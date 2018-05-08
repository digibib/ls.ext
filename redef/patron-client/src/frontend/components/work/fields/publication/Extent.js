import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Extent = ({ extents }) => {
  if (extents.length > 0) {
    return (
      <MetaItem label={messages.extent} data-automation-id="publication_extent">{extents.join(', ')}</MetaItem>
    )
  } else {
    return null
  }
}

Extent.propTypes = {
  extents: PropTypes.array
}

export const messages = defineMessages({
  extent: {
    id: 'Extent.extent',
    description: 'Label for extent meta',
    defaultMessage: 'Extent'
  }
})

export default Extent
