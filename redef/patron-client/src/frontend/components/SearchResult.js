import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { defineMessages, FormattedMessage } from 'react-intl'

export default React.createClass({
  propTypes: {
    result: PropTypes.object.isRequired
  },
  renderAuthors (creators) {
    if (creators.length === 0) {
      return
    }
    let authorLabel = 'Forfatter'
    if (creators.length > 1) {
      authorLabel = 'Forfattere'
    }
    return (
      <p data-automation-id='work_creators'>{authorLabel}: {creators.map(creator => {
        return <strong key={creator.relativeUri}><Link to={creator.relativeUri}> {creator.name} </Link></strong>
      })}
      </p>
    )
  },
  renderDisplayTitle (result) {
    let displayTitle = result.mainTitle
    if (result.partTitle) {
      displayTitle += ' — ' + result.partTitle
    }
    return (
      <Link to={result.relativeUri}>
        <span className='workTitle' data-automation-id='work-title'>{displayTitle}</span>
      </Link>
    )
  },
  render () {
    let result = this.props.result

    let originalTitle = ''
    if (result.originalTitle) {
      originalTitle = (
        <p data-automation-id='work_originaltitle'>
          Originaltittel:
          {result.originalTitle}
        </p>
      )
    }

    let formats = result.publications
      ? [ ...new Set(result.publications.filter(publication => publication.format).map(publication => publication.format)) ]
      : []

    return (
      <div className='col result panel'>
        <div className='row'>
          <div className='col book-cover placeholder'>
            <Link to={result.relativeUri}/>
          </div>
          <div className='col result-info'>
            <p>
              <strong>{this.renderDisplayTitle(result)}</strong>
            </p>
            {this.renderAuthors(result.creators)}
            {originalTitle}
          </div>
        </div>
        <div className='row result-more'>
          <div className='col' data-automation-id='work_formats'>
            <strong><FormattedMessage {...messages.availableAs} /></strong>
            <br/>
            {formats.join(', ')}
          </div>
          <div className='col right'>
            <Link to={result.relativeUri} className='more'>
              <FormattedMessage {...messages.allPublications} />
            </Link>
          </div>
        </div>
      </div>
    )
  }
})

const messages = defineMessages({
  allPublications: {
    id: 'SearchResult.allPublications',
    description: 'Link to go to all publications',
    defaultMessage: 'all publications ►'
  },
  availableAs: {
    id: 'SearchResult.availableAs',
    description: 'What formats the results is available as',
    defaultMessage: 'Available as:'
  }
})
