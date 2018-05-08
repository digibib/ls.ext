import PropTypes from 'prop-types'
import React from 'react'

const Title = ({title, untranscribedTitle}) => (
  <div>
    { untranscribedTitle
      ? <h1 data-automation-id="work_title_untranscribed">{untranscribedTitle}</h1>
      : null
    }
    <h1 data-automation-id="work_title">{title}</h1>
  </div>
)

Title.propTypes = {
  title: PropTypes.string,
  untranscribedTitle: PropTypes.string
}

export default Title
