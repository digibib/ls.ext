import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const WorkSerie = ({ workserie, intl }) => {
  if (workserie.length > 0) {
    return (
      <MetaItem label={messages.labelWorkSerie} data-automation-id="work_work_serie">
        {workserie.map(ws => intl.formatMessage({ id: ws })).join(', ')}
      </MetaItem>
    )
  } else {
    return null
  }
}

WorkSerie.defaultProps = {
  workserie: []
}

WorkSerie.propTypes = {
  workserie: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelWorkSerie: {
    id: 'WorkSerie.labelWorkSerie',
    description: 'Label for work serie',
    defaultMessage: 'A part of serie'
  }
})

export default injectIntl(WorkSerie)
