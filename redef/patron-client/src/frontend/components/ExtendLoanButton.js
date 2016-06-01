import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

class ExtendLoanButton extends React.Component {
  constructor (props) {
    super(props)
    this.handleExtendLoanClick = this.handleExtendLoanClick.bind(this)
  }

  handleExtendLoanClick (event) {
    event.preventDefault()
    this.props.startExtendLoan(this.props.checkoutId)
  }

  render () {
    return (
      <button onClick={this.handleExtendLoanClick} className='black-btn'>
        <FormattedMessage {...messages.extendLoan} />
      </button>
    )
  }
}

ExtendLoanButton.propTypes = {
  checkoutId: PropTypes.string.isRequired,
  startExtendLoan: PropTypes.func.isRequired
}

const messages = defineMessages({
  extendLoan: {
    id: 'ExtendLoanButton.extendLoan',
    description: 'The label on the button to extend a loan',
    defaultMessage: 'Extend loan'
  }
})

export default ExtendLoanButton
