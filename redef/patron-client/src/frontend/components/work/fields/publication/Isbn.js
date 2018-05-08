import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Isbn = ({ isbn }) => {
  if (isbn.length > 0) {
    return (
      <MetaItem label={messages.isbn} data-automation-id="publication_isbn">{isbn.join(', ')}</MetaItem>
    )
  } else {
    return null
  }
}

Isbn.defaultProps = {
  isbn: []
}

Isbn.propTypes = {
  isbn: PropTypes.array.isRequired
}

export const messages = defineMessages({
  isbn: {
    id: 'Isbn.isbn',
    description: 'Label for ISBN meta',
    defaultMessage: 'ISBN'
  }
})

export default Isbn
