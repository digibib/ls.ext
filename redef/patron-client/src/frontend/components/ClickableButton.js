import React, { PropTypes } from 'react'

class ClickableButton extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick (event) {
    event.preventDefault()
    this.props.onClickAction.apply(this, this.props.onClickArguments)
  }

  render () {
    return (
      <button onClick={this.handleClick} className="black-btn">
        {this.props.children}
      </button>
    )
  }
}

ClickableButton.propTypes = {
  onClickAction: PropTypes.func.isRequired,
  onClickArguments: PropTypes.array.isRequired,
  children: PropTypes.node
}

export default ClickableButton
