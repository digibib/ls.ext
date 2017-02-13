import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const Key = ({ keys, intl }) => {
  if (keys.length > 0) {
    return (
      <MetaItem label={messages.labelKey} data-automation-id="work_key">
        {keys.map(key => intl.formatMessage({ id: key })).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

Key.propTypes = {
  keys: PropTypes.string,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelKey: {
    id: 'Key.labelKey',
    description: 'Label for key',
    defaultMessage: 'Key'
  }
})

export default injectIntl(Key)
