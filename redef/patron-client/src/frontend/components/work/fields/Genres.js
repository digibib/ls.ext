import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'
import fieldQueryLink from '../../../utils/link'

class Genres extends React.Component {
  render () {
    if (this.props.genres.length > 0) {
      const genres = this.props.genres
      return (
        <aside className="work-genres">
          <h2><FormattedMessage {...messages.genre} /></h2>
          <ul data-automation-id="work_genres">
            {genres.map(genre => <li key={genre.linkField}><Link to={fieldQueryLink('sjanger', genre.linkField)}>{genre.linkLabel}</Link></li>)}
          </ul>
          <a className="patron-placeholder" href="#" alt="More genres">Se flere sjangre</a>
        </aside>
      )
    } else {
      return null
    }
  }
}

Genres.defaultProps = {
  genres: []
}

Genres.propTypes = {
  genres: PropTypes.array.isRequired
}

export const messages = defineMessages({
  genre: {
    id: 'Genres.genre',
    description: 'The text displayed to identify genres',
    defaultMessage: 'Genre:'
  }
})

export default Genres
