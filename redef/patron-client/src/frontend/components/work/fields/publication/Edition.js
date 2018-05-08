import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Edition = ({ edition }) => {
  if (edition) {
    return (
      <MetaItem label={messages.edition} data-automation-id="publication_edition">{edition}</MetaItem>
    )
  } else {
    return null
  }
}

Edition.propTypes = {
  edition: PropTypes.string
}

export const messages = defineMessages({
  edition: {
    id: 'Edition.edition',
    description: 'Label for edition meta',
    defaultMessage: 'Edition'
  }
})

export default Edition
