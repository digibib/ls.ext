import React, {PropTypes} from 'react'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import {connect} from 'react-redux'
import {bindActionCreators} from 'redux'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
import {routerActions} from 'react-router-redux'
import {Link} from 'react-router'
import fieldQueryLink from '../utils/link'
import isEmpty from '../utils/emptyObject'

import * as ProfileActions from '../actions/ProfileActions'
import ClickableElement from '../components/ClickableElement'
import {formatDate} from '../utils/dateFormatter'
import Loading from '../components/Loading'

class UserHistory extends React.Component {
  render () {
    return (
      <div>
        <p>User history here</p>
      </div>
    )
  }
}

UserHistory.propTypes = {}
export const messages = defineMessages({})

function mapStateToProps (state) {
  return {
    loansAndReservationError: state.profile.loansAndReservationError
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    profileActions: bindActionCreators(ProfileActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(UserHistory))
