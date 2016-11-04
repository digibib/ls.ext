import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'

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
    return <ReactCSSTransitionGroup {...props} />
  }
}

NonIETransitionGroup.propTypes = {
  className: PropTypes.string,
  component: PropTypes.string.isRequired
}

export default NonIETransitionGroup

function isIe () {
  return !!navigator.userAgent.match(/Trident/g) || !!navigator.userAgent.match(/MSIE/g)
}
