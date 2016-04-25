import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

const SearchResult = React.createClass({
  propTypes: {
    result: PropTypes.object.isRequired,
    intl: intlShape.isRequired
  },
  renderContributors (contributors) {
    if (contributors.length === 0) {
      return
    }
    return (
      <p data-automation-id='work_contributors'> {contributors.map(contribution => (
        <span
          key={contribution.agent.relativeUri}>{this.props.intl.formatMessage({ id: contribution.role })}: <strong><Link
          to={contribution.agent.relativeUri}> {contribution.agent.name} </Link></strong></span>
      ))}
      </p>
    )
  },
  renderDisplayTitle (result) {
    let displayTitle = result.mainTitle
    if (result.partTitle) {
      displayTitle += ` — ${result.partTitle}`
    }
    return (
      <Link data-automation-id='work-link' to={result.relativeUri}>
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

    let pubFormats = new Set()
    result.publications.forEach(publication => {
      publication.formats.forEach(format => {
        pubFormats.add(this.props.intl.formatMessage({ id: format }))
      })
    })
    let formats = [ ...pubFormats ]

    return (
      <article className='single-entry'>
        <div className='book-cover'>
          <Link to={result.relativeUri} />
        </div>
        <div className='entry-content'>
          <h1>
            {this.renderDisplayTitle(result)}
          </h1>

          <div>
            {this.renderContributors(result.contributors)}
          </div>

          <div>
            {this.renderOriginalTitle(result)}
          </div>
        </div>
        <div className='row result-more'>
          <div className='col' data-automation-id='work_formats'>
            <strong><FormattedMessage {...messages.availableAs} /></strong>
            <br />
            {formats.join(', ')}
          </div>
          <div className='col right'>
            <Link to={result.relativeUri} className='more'>
              <FormattedMessage {...messages.allPublications} />
            </Link>
          </div>
        </div>
      </article>
    )
  }
})

const messages = defineMessages({
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
