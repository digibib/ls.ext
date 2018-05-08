import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const LiteraryForms = ({ literaryForms, intl }) => {
  if (literaryForms.length > 0) {
    return (
      <MetaItem label={messages.labelLiteraryForms} data-automation-id="work_literaryForms">
        {literaryForms.map(literaryForm => intl.formatMessage({ id: literaryForm })).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

LiteraryForms.defaultProps = {
  literaryForms: []
}

LiteraryForms.propTypes = {
  literaryForms: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelLiteraryForms: {
    id: 'LiteraryForms.labelLiteraryForm',
    description: 'Label for original literaryForm',
    defaultMessage: 'Form'
  }
})

export default injectIntl(LiteraryForms)
