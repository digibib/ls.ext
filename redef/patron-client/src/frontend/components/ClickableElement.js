import React, { PropTypes } from 'react'

class ClickableElement extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event) {
    event.preventDefault()
    this.props.onClickAction.apply(this, this.props.onClickArguments)
  }

  render () {
    if (!this.props.children) {
      return null
    } else if (React.isValidElement(this.props.children)) {
      return React.cloneElement(this.props.children, { onClick: this.handleClick })
    } else {
      throw Error('Children must have one root element')
    }
  }
}

ClickableElement.propTypes = {
  onClickAction: PropTypes.func.isRequired,
  onClickArguments: PropTypes.array.isRequired,
  children: PropTypes.node
}

export default ClickableElement
