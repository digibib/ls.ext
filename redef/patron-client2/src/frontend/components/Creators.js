import React, { PropTypes } from 'react'
import { Link } from 'react-router'

export default React.createClass({
  propTypes: {
    creators: PropTypes.array.isRequired
  },
  render () {
    return (
      <h3>{this.props.creators.map(creator => {
        return (
          <Link data-automation-id='work_author' key={creator.relativeUri} to={creator.relativeUri}>
            {creator.name}
          </Link>
        )
      })}</h3>
    )
  }
})
