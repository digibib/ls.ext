import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

import { Link } from 'react-router'
import fieldQueryLink from '../../../utils/link'

const Biographies = ({ biographies, intl }) => {
  if (biographies.length > 0) {
    return (
      <MetaItem label={messages.labelBiographies} data-automation-id="work_biographies">
        <br />
        {biographies.map((biography, index) =>
           <span key={biography.id}>
             <Link to={fieldQueryLink('bio', intl.formatMessage({id: biography.id}))}>
               {intl.formatMessage({ id: biography.id })}
             </Link>
             { index + 1 === biographies.length ? '' : ', '}
           </span>
         )}
      </MetaItem>
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
