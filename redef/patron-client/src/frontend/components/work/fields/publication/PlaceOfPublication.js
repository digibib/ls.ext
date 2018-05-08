import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const PlaceOfPublication = ({ placeOfPublication }) => {
  if (placeOfPublication) {
    return (
      <MetaItem label={messages.placeOfPublication} data-automation-id="publication_placeOfPublication">
        {placeOfPublication}
      </MetaItem>
    )
  } else {
    return null
  }
}

PlaceOfPublication.propTypes = {
  placeOfPublication: PropTypes.string
}

export const messages = defineMessages({
  placeOfPublication: {
    id: 'PlaceOfPublication.placeOfPublication',
    description: 'Label for placeOfPublication meta',
    defaultMessage: 'PlaceOfPublication'
  }
})

export default PlaceOfPublication
