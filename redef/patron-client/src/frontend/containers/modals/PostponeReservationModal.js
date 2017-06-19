import PropTypes from 'prop-types'
import React from 'react'

import PostponeForm from '../../containers/forms/PostponeReservationForm'

class PostponeReservationModal extends React.Component {
  render () {
    return (
      <div data-automation-id="reserve_postpone_modal" className="default-modal">
        <PostponeForm />
      </div>
    )
  }
}

export default PostponeReservationModal
