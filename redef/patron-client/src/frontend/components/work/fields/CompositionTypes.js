import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

import { Link } from 'react-router'
import fieldQueryLink from '../../../utils/link'

const CompositionTypes = ({ compositionTypes }) => {
  if (compositionTypes.length > 0) {
    return (
      <MetaItem label={messages.labelCompositionTypes} data-automation-id="work_compositionTypes">
        <br />
        {compositionTypes.map((type, index) =>
          <span key={type.linkField}>
            <Link to={fieldQueryLink('komposisjonstype', type.linkField)}>{type.linkLabel}</Link>
            { index + 1 === compositionTypes.length ? '' : ', '}
          </span>
        )}
      </MetaItem>
    )
  } else {
    return null
  }
}

CompositionTypes.defaultProps = {
  compositionTypes: []
}

CompositionTypes.propTypes = {
  compositionTypes: PropTypes.array.isRequired
}

export const messages = defineMessages({
  labelCompositionTypes: {
    id: 'CompositionTypes.labelCompositionTypes',
    description: 'Label for the composition types',
    defaultMessage: 'Composition types'
  }
})

export default CompositionTypes
