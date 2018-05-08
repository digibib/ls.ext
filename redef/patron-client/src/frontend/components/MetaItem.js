import PropTypes from 'prop-types'
import React from 'react'
import { FormattedMessage } from 'react-intl'

const MetaItem = (props) => {
  const dataAutomationId = props[ 'data-automation-id' ]
  const { label, children } = props

  return (
    <div className="meta-item">
      <span className="meta-label"><FormattedMessage {...label} />: </span>
      <span
        role="definition"
        aria-labelledby={label.defaultMessage}
        data-automation-id={dataAutomationId}
        className="meta-content">{children}</span>
    </div>
  )
}

MetaItem.propTypes = {
  label: PropTypes.shape({
    id: PropTypes.string.isRequired,
    defaultMessage: PropTypes.string.isRequired
  }).isRequired,
  children: PropTypes.node.isRequired,
  'data-automation-id': PropTypes.string
}

export default MetaItem
