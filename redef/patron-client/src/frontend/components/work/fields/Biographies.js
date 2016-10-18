import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const Biographies = ({ biographies, intl }) => {
  if (biographies.length > 0) {
    return (
      <MetaItem
        content={biographies.map(biography => intl.formatMessage({ id: biography })).join(', ')}
        label={messages.labelBiographies}
        data-automation-id="work_biographies"
      />
    )
  } else {
    return null
  }
}

Biographies.defaultProps = {
  biographies: []
}

Biographies.propTypes = {
  biographies: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelBiographies: {
    id: 'Biographies.labelBiographies',
    description: 'Label for biographies',
    defaultMessage: 'Biography'
  }
})

export default injectIntl(Biographies)
