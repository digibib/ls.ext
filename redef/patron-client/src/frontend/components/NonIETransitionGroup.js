import React from 'react'
import PropTypes from 'prop-types'
import { CSSTransitionGroup } from 'react-transition-group'

import isIe from '../utils/isIe'

const NonIETransitionGroup = (props) => {
  if (isIe()) {
    const { component, className } = props
    const elementProps = { className }
    Object.keys(props).forEach(prop => {
      if (prop.startsWith('data-')) {
        elementProps[ prop ] = props[ prop ]
      }
    })
    return React.createElement(component, props)
  } else {
    return <CSSTransitionGroup {...props} />
  }
}

NonIETransitionGroup.propTypes = {
  className: PropTypes.string,
  component: PropTypes.string.isRequired
}

export default NonIETransitionGroup
