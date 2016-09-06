import React, { PropTypes } from 'react'

class ClickableElement extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event) {
    const { onClickAction, onClickArguments } = this.props
    event.preventDefault()
    event.stopPropagation()
    onClickAction.apply(this, Array.isArray(onClickArguments) ? onClickArguments : [ onClickArguments ])
  }

  render () {
    const { children } = this.props
    if (!children) {
      return null
    } else if (React.isValidElement(children)) {
      return React.cloneElement(children, { onClick: this.handleClick })
    } else {
      throw Error('Children must have one root element')
    }
  }
}

ClickableElement.propTypes = {
  onClickAction: PropTypes.func.isRequired,
  onClickArguments: PropTypes.any,
  children: PropTypes.node
}

export default ClickableElement
