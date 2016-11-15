import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'
import title from '../../../utils/title'

const OriginalTitle = ({ mainTitle, subtitle, partNumber, partTitle }) => {
  if (mainTitle) {
    return (
      <MetaItem label={messages.labelOriginalTitle} data-automation-id="work_originalTitle">
        {title({ mainTitle, subtitle, partNumber, partTitle })}
      </MetaItem>
    )
  } else {
    return null
  }
}

OriginalTitle.propTypes = {
  mainTitle: PropTypes.string,
  subtitle: PropTypes.string,
  partNumber: PropTypes.string,
  partTitle: PropTypes.string
}

export const messages = defineMessages({
  labelOriginalTitle: {
    id: 'OriginalTitle.labelOriginalTitle',
    description: 'Label for original title',
    defaultMessage: 'Original title'
  }
})

export default OriginalTitle
