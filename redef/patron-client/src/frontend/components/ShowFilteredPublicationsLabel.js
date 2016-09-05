import React, { PropTypes } from 'react'

import ClickableElement from '../components/ClickableElement'

const ShowFilteredPublicationsLabel = ({ open, showingRestLabel, toggleParameterValue, mediaType }) => {
  return (
    <ClickableElement onClickAction={toggleParameterValue} onClickArguments={[ 'showAllResults', mediaType ]}>
      <div>
        <p style={{ fontSize: '1.1em', marginBottom: '0', color: 'red', textAlign: 'center', fontWeight: 'bolder' }}>{showingRestLabel}</p>
        <img style={{ height: '0.5em' }} src={open ? '/images/btn-arrow-close.svg' : '/images/btn-arrow-open.svg'}
             alt="Red arrow pointing down" />
      </div>
    </ClickableElement>
  )
}

ShowFilteredPublicationsLabel.PropTypes = {
  showingRestLabel: PropTypes.object.isRequired,
  toggleParameterValue: PropTypes.func.isRequired,
  mediaType: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired
}

export default ShowFilteredPublicationsLabel
