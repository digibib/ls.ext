import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const NumberOfPages = ({ numberOfPages }) => {
  if (numberOfPages) {
    return (
      <MetaItem label={messages.numberOfPages} data-automation-id="publication_numberOfPages">{numberOfPages}</MetaItem>
    )
  } else {
    return null
  }
}

NumberOfPages.propTypes = {
  numberOfPages: PropTypes.string
}

export const messages = defineMessages({
  numberOfPages: {
    id: 'NumberOfPages.numberOfPages',
    description: 'Label for number of pages meta',
    defaultMessage: 'Number of pages'
  }
})

export default NumberOfPages
