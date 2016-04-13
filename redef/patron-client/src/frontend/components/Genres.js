import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

export default React.createClass({
  propTypes: {
    genres: PropTypes.array.isRequired
  },
  render () {
    return (
      <h3><FormattedMessage {...messages.genre} /> {this.props.genres.map(genre => (
          <span data-automation-id='work_genre' key={genre.relativeUri}>
            {genre.name}
          </span>
        )
      )}</h3>
    )
  }
})

const messages = defineMessages({
  genre: {
    id: 'Genres.genre',
    description: 'The text displayed to identify genres',
    defaultMessage: 'Genre:'
  }
})
