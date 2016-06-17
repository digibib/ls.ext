import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import Items from '../components/Items'
import createPath from '../utils/createPath'

class SearchResult extends React.Component {
  constructor (props) {
    super(props)
    this.handleShowStatusClick = this.handleShowStatusClick.bind(this)
  }

  componentWillMount () {
    const { id } = this.props.result
    if (this.shouldShowStatus() && !this.props.resources[ id ]) {
      this.props.fetchWorkResource(id)
    }
  }

  renderContributors (contributors) {
    if (contributors.length > 0) {
      return (
        <p data-automation-id='work_contributors'> {contributors.map(contribution => (
          <span
            key={contribution.agent.relativeUri}>{this.props.intl.formatMessage({ id: contribution.role })}: <strong><Link
            to={contribution.agent.relativeUri}> {contribution.agent.name} </Link></strong></span>
        ))}
        </p>
      )
    }
  }

  renderDisplayTitle (result) {
    return (
      <Link data-automation-id='work-link' to={this.getResultUrl(result)}>
        <span className='workTitle' data-automation-id='work-title'>{result.displayTitle}</span>
      </Link>
    )
  }

  renderOriginalTitle (publication) {
    if (publication.originalTitle) {
      return (
        <p data-automation-id='work_originaltitle'>
          <FormattedMessage {...messages.originalTitle} /> {publication.originalTitle}
        </p>
      )
    }
  }

  subjectSearchLink (subject) {
    return '/search?query=publication.subjects%3A' + subject
  }

  renderSubjects (result) {
    if (result.subjects) {
      return (
        <p data-automation-id='work_subjects'>
          <strong>
            <FormattedMessage {...messages.subjects} />
            {result.subjects.map(subject => (
              <span key={subject}>
                <Link to={this.subjectSearchLink(subject)}> {subject} </Link>
                </span>
            ))}
          </strong>
        </p>
      )
    }
  }

  getResultUrl (result) {
    const { pathname, search, hash } = window.location
    return createPath({
      pathname: result.relativePublicationUri || result.relativeUri,
      query: { back: `${pathname}${search}${hash}` }
    })
  }

  renderItems (result) {
    const resource = this.props.resources[ result.id ]
    if (resource) {
      return <Items items={resource.items} />
    }
  }

  handleShowStatusClick (event) {
    event.stopPropagation()
    this.props.fetchWorkResource(this.props.result.id)
    this.props.showStatus(this.props.result.id)
  }

  shouldShowStatus () {
    const { locationQuery: { showStatus }, result: { id } } = this.props
    return (showStatus && showStatus === id || (Array.isArray(showStatus) && showStatus.includes(id)))
  }

  render () {
    const { result } = this.props
    const firstPublishedYear = result.publication.firstPublicationYear
    const pubFormats = new Set()
    result.publication.formats = result.publication.formats || []
    result.publication.formats.forEach(format => {
      pubFormats.add(this.props.intl.formatMessage({ id: format }))
    })

    const formats = [ ...pubFormats ]
    return (
      <div className='single-entry' data-formats={formats.join(', ')}>
        <aside className='book-cover'>
          <Link to={this.getResultUrl(result)} className='book-cover-item'>
            {result.image ? <img src={result.image} /> : null}
          </Link>
        </aside>

        <article className='entry-content'>

          <div className='entry-content-icon patron-placeholder'>
            <div className='entry-content-icon-single'>

              <img src='/images/icon-audiobook.svg' alt='Black speaker with audio waves' />
              <p>Lydbok</p>

            </div>
          </div>

          <h1>
            {this.renderDisplayTitle(result)}
          </h1>

          <div className='contributors'>
            {this.renderContributors(result.publication.contributors)}
          </div>

          <div>
            {this.renderOriginalTitle(result.publication)}
          </div>

          <div>
            {this.renderSubjects(result.publication)}
          </div>

          {firstPublishedYear
            ? <div>
                <strong><FormattedMessage {...messages.firstPublished} /></strong> <span>{firstPublishedYear}</span>
              </div>
            : null
          }

          <div>
            <p className='patron-placeholder'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget massa
              id mauris maximus
              porta. In dignissim, metus in elementum ultrices, erat velit gravida turpis, id efficitur
              nunc est vitae purus. Aliquam ornare efficitur tellus sit amet dapibus. Aliquam ultrices,
              sapien in volutpat vehicula, lacus nunc pretium leo, quis dignissim arcu nisl vitae velit.
              Aliquam sit amet nisl non tortor elementum consequat. Morbi id nulla ac quam luctus posuere
              nec a risus. Aenean congue quam tortor, a volutpat quam mollis nec. Nullam metus ex,
              efficitur vitae tortor vitae, imperdiet semper nisl. Mauris vel accumsan odio, venenatis
              fringilla ex.</p>
          </div>
        </article>

        {this.shouldShowStatus()
          ? [ (<div key='show-more-content' className='show-more-content' onClick={this.handleShowStatusClick}>
          <p><FormattedMessage {...messages.hideStatus} /></p>
          <img src='/images/btn-red-arrow-close.svg' alt='Red arrow pointing up' />
        </div>),
          (<div key='entry-more-content' className='entry-content-more'>
            {this.renderItems(result)}
          </div>) ]
          : (<div className='show-more-content' onClick={this.handleShowStatusClick}>
          <p><FormattedMessage {...messages.showStatus} /></p>
          <img src='/images/btn-red-arrow-open.svg' alt='Red arrow pointing down' />
        </div>)
        }

      </div>
    )
  }
}

SearchResult.propTypes = {
  result: PropTypes.object.isRequired,
  locationQuery: PropTypes.object.isRequired,
  showStatus: PropTypes.func.isRequired,
  resources: PropTypes.object.isRequired,
  fetchWorkResource: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

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
  },
  subjects: {
    id: 'SearchResult.subjects',
    description: 'The text displayed to identify subjects',
    defaultMessage: 'Subjects:'
  },
  showStatus: {
    id: 'SearchResult.showStatus',
    description: 'Shown when the status is hidden',
    defaultMessage: 'Show status'
  },
  hideStatus: {
    id: 'SearchResult.hideStatus',
    description: 'Shown when the status is shown',
    defaultMessage: 'Hide status'
  },
  firstPublished: {
    id: 'SearchResult.firstPublished',
    description: 'Label for when the work was first published',
    defaultMessage: 'First published: '
  }
})

export default injectIntl(SearchResult)
