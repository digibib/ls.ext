import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const NumberOfPages = ({ numberOfPages }) => {
  if (numberOfPages.length > 0) {
    return (
      <MetaItem label={messages.numberOfPages} data-automation-id="publication_numberOfPages">{numberOfPages.join(', ')}</MetaItem>
    )
  } else {
    return null
  }
}

NumberOfPages.propTypes = {
  numberOfPages: PropTypes.array
}

export const messages = defineMessages({
  numberOfPages: {
    id: 'NumberOfPages.numberOfPages',
    description: 'Label for number of pages meta',
    defaultMessage: 'Number of pages'
  }
})

export default NumberOfPages
