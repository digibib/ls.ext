import PropTypes from 'prop-types'
import React from 'react'

import ClickableElement from '../components/ClickableElement'

const ShowFilteredPublicationsLabel = ({ open, showingRestLabel, toggleParameterValue, mediaType }) => (
  <ClickableElement onClickAction={toggleParameterValue} onClickArguments={[ 'showAllResults', mediaType ]}>
    <div className="toggle-all-publications">
      {showingRestLabel}
      {open ? <i className="icon-up-open" /> : <i className="icon-down-open" />}
    </div>
  </ClickableElement>
)

ShowFilteredPublicationsLabel.propTypes = {
  showingRestLabel: PropTypes.object.isRequired,
  toggleParameterValue: PropTypes.func.isRequired,
  mediaType: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired
}

export default ShowFilteredPublicationsLabel
