import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

const SearchResult = React.createClass({
  propTypes: {
    result: PropTypes.object.isRequired,
    intl: intlShape.isRequired
  },
  renderAuthors (creators) {
    if (creators.length === 0) {
      return
    }
    let authorLabel = <FormattedMessage {...messages.author} />
    if (creators.length > 1) {
      authorLabel = <FormattedMessage {...messages.authors} />
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
      displayTitle += ` — ${result.partTitle}`
    }
    return (
      <Link to={result.relativeUri}>
        <span className='workTitle' data-automation-id='work-title'>{displayTitle}</span>
      </Link>
    )
  },
  renderOriginalTitle (result) {
    if (result.originalTitle) {
      return (
        <p data-automation-id='work_originaltitle'>
          <FormattedMessage {...messages.originalTitle} /> {result.originalTitle}
        </p>
      )
    }
  },
  render () {
    let result = this.props.result
    let formats = result.publications
      ? [ ...new Set(result.publications.filter(publication => publication.format).map(publication => this.props.intl.formatMessage({ id: publication.format }))) ]
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
            {this.renderOriginalTitle(result)}
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
  author: {
    id: 'SearchResult.author',
    description: 'The label when one author',
    defaultMessage: 'Author'
  },
  authors: {
    id: 'SearchResult.authors',
    description: 'The label when multiple authors',
    defaultMessage: 'Authors'
  },
  originalTitle: {
    id: 'SearchResult.originalTitle',
    description: 'The label for the original title',
    defaultMessage: 'Original title:'
  },
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

export default injectIntl(SearchResult)
