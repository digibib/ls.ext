import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

const Binding = ({ binding, intl }) => {
  if (binding) {
    return (
      <MetaItem label={messages.labelBinding} data-automation-id="publication_binding">
        {intl.formatMessage({ id: binding })}
      </MetaItem>
    )
  } else {
    return null
  }
}

Binding.propTypes = {
  binding: PropTypes.string,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelBinding: {
    id: 'Binding.labelBinding',
    description: 'Label for binding',
    defaultMessage: 'Binding'
  }
})

export default injectIntl(Binding)
