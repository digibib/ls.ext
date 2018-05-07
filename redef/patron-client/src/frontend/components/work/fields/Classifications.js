import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

import { Link } from 'react-router'
import fieldQueryLink from '../../../utils/link'

const Classifications = ({ classifications }) => {
  if (classifications.length > 0) {
    return (
      <MetaItem label={messages.labelClassifications} data-automation-id="work_classifications">
        <br />
        {classifications.map((code, index) =>
          <span key={code}>
            <Link to={fieldQueryLink('klasse', code)}>{code}</Link>
            { index + 1 === classifications.length ? '' : ', '}
          </span>
        )}
      </MetaItem>
    )
  } else {
    return null
  }
}

Classifications.defaultProps = {
  classifications: []
}

Classifications.propTypes = {
  classifications: PropTypes.array.isRequired
}

export const messages = defineMessages({
  labelClassifications: {
    id: 'Classifications.labelClassifications',
    description: 'Label for the classifications',
    defaultMessage: 'Classification'
  }
})

export default Classifications
