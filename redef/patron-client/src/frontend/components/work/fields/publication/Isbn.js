import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Isbn = ({ isbn }) => {
  if (isbn) {
    return (
      <MetaItem label={messages.isbn} data-automation-id="publication_isbn">{isbn}</MetaItem>
    )
  } else {
    return null
  }
}

Isbn.propTypes = {
  isbn: PropTypes.string
}

export const messages = defineMessages({
  isbn: {
    id: 'Isbn.isbn',
    description: 'Label for ISBN meta',
    defaultMessage: 'ISBN'
  }
})

export default Isbn
