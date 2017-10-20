import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const OriginalTitle = ({ title, untranscribedTitle }) => {
  if (title) {
    return (
      <MetaItem label={messages.labelOriginalTitle} data-automation-id="work_originalTitle">
        { untranscribedTitle ? `${untranscribedTitle} | ${title}` : title }
      </MetaItem>
    )
  } else {
    return null
  }
}

OriginalTitle.propTypes = {
  title: PropTypes.string,
  untranscribedTitle: PropTypes.string
}

export const messages = defineMessages({
  labelOriginalTitle: {
    id: 'OriginalTitle.labelOriginalTitle',
    description: 'Label for original title',
    defaultMessage: 'Original title'
  }
})

export default OriginalTitle
