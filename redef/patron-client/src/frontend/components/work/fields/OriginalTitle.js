import React, { PropTypes } from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const OriginalTitle = ({ mainTitle, subtitle, partNumber, partTitle }) => {
  if (mainTitle) {
    return (
      <MetaItem label={messages.labelOriginalTitle}
                data-automation-id="work_originalTitle"
                content={
                  <span>
                    {mainTitle}{(subtitle || partNumber || partTitle) ? ':' : null}{subtitle ? ` ${subtitle}.` : null}{partNumber ? ` ${partNumber}.` : null}{partTitle ? ` ${partTitle}` : null}
                  </span>
                } />
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
