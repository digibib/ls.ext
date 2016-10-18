import React, { PropTypes } from 'react'
import { FormattedMessage } from 'react-intl'

const MetaItem = (props) => {
  const dataAutomationId = props[ 'data-automation-id' ]
  const { label, content } = props

  return (
    <div className="meta-item">
      <span className="meta-label"><FormattedMessage {...label} />: </span>
      <span
        data-automation-id={dataAutomationId}
        className="meta-content">{content}</span>
    </div>
  )
}

MetaItem.propTypes = {
  label: PropTypes.shape({
    id: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired
  }).isRequired,
  content: PropTypes.oneOfType([ PropTypes.string, PropTypes.node ]).isRequired,
  'data-automation-id': PropTypes.string
}

export default MetaItem
