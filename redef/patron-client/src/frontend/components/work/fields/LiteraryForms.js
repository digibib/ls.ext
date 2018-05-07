import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

import { Link } from 'react-router'
import fieldQueryLink from '../../../utils/link'

const LiteraryForms = ({ literaryForms, intl }) => {
  if (literaryForms.length > 0) {
    return (
      <MetaItem label={messages.labelLiteraryForms} data-automation-id="work_literaryForms">
        {literaryForms.map((literaryForm, index) =>
          <span key={literaryForm}>
            <Link to={fieldQueryLink('form', intl.formatMessage({id: literaryForm}))}>
              {intl.formatMessage({ id: literaryForm })}
            </Link>
            { index + 1 === literaryForms.length ? '' : ', '}
          </span>
        )}
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
