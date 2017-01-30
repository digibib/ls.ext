import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import { Link } from 'react-router'
import MetaItem from '../../MetaItem'
import isEmpty from '../../../utils/emptyObject'

const WorkSerie = ({ workserie }) => {
  if (!isEmpty(workserie)) {
    return (
      <MetaItem label={messages.labelWorkSerie} data-automation-id="work_work_serie">
        <Link
          data-automation-id="work_series_link"
          to={`/search?query=series:%3A"${workserie.mainTitle}"`}>
          {workserie.mainTitle}
        </Link>
      </MetaItem>
    )
  }
  return null
}

WorkSerie.defaultProps = {
  workserie: {}
}

WorkSerie.propTypes = {
  workserie: PropTypes.object.isRequired,
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
