import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {injectIntl} from 'react-intl'
import QueryString from 'query-string'

import * as LoanActions from '../actions/LoanActions'

class PaymentResponse extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      transactionSaved: false
    }
  }

  componentDidMount () {
    const transactionId = QueryString.parse(this.props.location.search).transactionId
    const responseCode = QueryString.parse(this.props.location.search).responseCode

    // TODO action to save resonponse to backend -> backend will call nets with SALE process -> backend will save transaction status i Koha
    this.props.loanActions.processFinePayment(transactionId)
  }

  render () {
    const { transactionSaved } = this.state

    if (!transactionSaved) {
      return (
        <div>
          Behandler transaksjonen
        </div>
      )
    }
    return (
      <div>
        Betaling ok!
      </div>
    )
  }
}

PaymentResponse.propTypes = {
  dispatch: PropTypes.func.isRequired,
  loanActions: PropTypes.object.isRequired,
}

function mapStateToProps (state) {
  return {
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    loanActions: bindActionCreators(LoanActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(PaymentResponse))
