import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const Key = ({ key, intl }) => {
  if (key) {
    return (
      <MetaItem content={intl.formatMessage({ id: key })} label={messages.labelKey} data-automation-id="work_key" />
    )
  } else {
    return null
  }
}

Key.propTypes = {
  key: PropTypes.string,
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
