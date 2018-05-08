import PropTypes from 'prop-types'
import React from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import { Link } from 'react-router'
import MetaItem from '../../MetaItem'
import title from '../../../utils/title'
import fieldQueryLink from '../../../utils/link'

const WorkSeries = ({ workSeries }) => {
  if (workSeries.length > 0) {
    return (
        <MetaItem label={messages.labelWorkSerie} data-automation-id="work_work_serie">
          {workSeries.map(serie =>
            <span key={serie.id}>
              <br />
              <Link
                data-automation-id="work_series_link"
                to={fieldQueryLink('serie', serie.mainTitle)}>
                {title(serie)}
              </Link>
              { serie.numberInSeries ? ` (${serie.numberInSeries})` : ''}
            </span>
          )}
        </MetaItem>
    )
  }
  return null
}

WorkSeries.defaultProps = {
  workSeries: []
}

WorkSeries.propTypes = {
  workSeries: PropTypes.array.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelWorkSerie: {
    id: 'WorkSerie.labelWorkSerie',
    description: 'Label for work serie',
    defaultMessage: 'A part of series'
  }
})

export default injectIntl(WorkSeries)
