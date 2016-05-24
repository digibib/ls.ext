import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

class Genres extends React.Component {
  renderLabel (genre) {
    let label = genre.prefLabel
    if (genre.genreSubdivision) {
      label += ` (${genre.genreSubdivision})`
    }
    return label
  }

  render () {
    const genres = this.props.genres.map(genre => this.renderLabel(genre))
    return (
      <div>
        <h2><FormattedMessage {...messages.genre} /></h2>
        <ul data-automation-id='work_genres'>
          {genres.map(genre => <li key={genre}><a href='#' alt={genre}>{genre}</a></li>)}
        </ul>
        <a className='patron-placeholder' href='#' alt='More genres'>Se flere sjangre</a>
      </div>
    )
  }
}

Genres.propTypes = {
  genres: PropTypes.array.isRequired
}

const messages = defineMessages({
  genre: {
    id: 'Genres.genre',
    description: 'The text displayed to identify genres',
    defaultMessage: 'Genre:'
  }
})

export default Genres
