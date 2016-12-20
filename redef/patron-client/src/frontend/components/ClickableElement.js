import React, { PropTypes } from 'react'

class ClickableElement extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
  }

  handleClick (event) {
    const { onClickAction, onClickArguments } = this.props
    event.preventDefault()
    event.stopPropagation()
    onClickAction(...Array.isArray(onClickArguments) ? onClickArguments : [ onClickArguments ])
  }

  handleEnter (event) {
    if (event.keyCode === 13) {
      this.handleClick(event)
    }
  }

  render () {
    const { children } = this.props
    if (!children) {
      return null
    } else if (React.isValidElement(children)) {
      return React.cloneElement(children, { onKeyDown: this.handleEnter, onClick: this.handleClick })
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
