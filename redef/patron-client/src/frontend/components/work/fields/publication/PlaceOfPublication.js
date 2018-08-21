import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const PlaceOfPublication = ({ placeOfPublication }) => {
  if (placeOfPublication.length > 0) {
    return (
      <MetaItem label={messages.placeOfPublication} data-automation-id="publication_placeOfPublication">
        {placeOfPublication.map(p => p.prefLabel).join(", ")}
      </MetaItem>
    )
  } else {
    return null
  }
}

PlaceOfPublication.propTypes = {
  placeOfPublication: PropTypes.array
}

export const messages = defineMessages({
  placeOfPublication: {
    id: 'PlaceOfPublication.placeOfPublication',
    description: 'Label for placeOfPublication meta',
    defaultMessage: 'PlaceOfPublication'
  }
})

export default PlaceOfPublication
