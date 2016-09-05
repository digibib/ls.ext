import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import Items from '../components/Items'
import MediaType from '../components/MediaType'
import createPath from '../utils/createPath'
import { groupByBranch } from '../utils/sorting'

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
        <div data-automation-id="work_contributors"> {contributors.map(contribution => (
          <p
            key={contribution.agent.relativeUri}><strong>{this.props.intl.formatMessage({ id: contribution.role })}: </strong><Link
            to={contribution.agent.relativeUri}> {contribution.agent.name} </Link></p>
        ))}
        </div>
      )
    }
  }

  renderDisplayTitle (result) {
    return (
      <Link data-automation-id="work-link" to={this.getResultUrl(result)}>
        <span className="workTitle" data-automation-id="work-title">{result.displayTitle}</span>
      </Link>
    )
  }

  renderOriginalTitle (publication) {
    if (publication.originalTitle) {
      return (
        <p data-automation-id="work_originaltitle">
          <FormattedMessage {...messages.originalTitle} /> {publication.originalTitle}
        </p>
      )
    }
  }

  subjectSearchLink (subject) {
    return '/search?query=subject%3A' + subject
  }

  genreSearchLink (genre) {
    return '/search?query=genre%3A' + genre
  }

  seriesSearchLink (series) {
    return '/search?query=series%3A' + series
  }

  renderSubjects (result) {
    if (result.subject) {
      return (
        <p data-automation-id="work_subjects">
          <strong><FormattedMessage {...messages.subjects} /></strong><br />
            {result.subject.map((subject, i) => (
              <span key={subject}>
                <Link to={this.subjectSearchLink(subject)}> {subject} </Link> {(i < result.subject.length - 1) ? '|' : null}
                </span>
            ))}
        </p>
      )
    }
  }

  renderGenres (result) {
    if (result.genre) {
      return (
        <p data-automation-id="work_genres">
          <strong><FormattedMessage {...messages.genres} /></strong><br />
            {result.genre.map((genre, i) => (
              <span key={genre}>
                <Link to={this.genreSearchLink(genre)}> {genre} </Link> {(i < result.genre.length - 1) ? '|' : null}
                </span>
            ))}
        </p>
      )
    }
  }

  renderSeries (series) {
    return (
      <div data-automation-id="publication_series">
        <strong><FormattedMessage {...messages.partOfSeries} /></strong>
          {series.map((serie, i) => (
            <span key={serie}>
              <Link to={this.seriesSearchLink(serie)}> {serie} </Link> {(i < series.length - 1) ? '|' : null}
            </span>
          ))}
      </div>
    )
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
      return groupByBranch(resource.items).map(el => {
        return (
          <div className="items-by-branch">
            <h1>{el.branch}</h1>
            <Items items={el.items} />
            <p style={{clear: 'both'}} />
          </div>
          )
      })
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

  bookCoverText (result) {
    if (result.publication.mainEntryName) {
      return `${result.displayTitle} / ${result.publication.mainEntryName}`
    }
    return result.mainTitle
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
    const coverAltText = this.props.intl.formatMessage(messages.coverImageOf, {title: result.displayTitle})
    const missingCoverImage = '/images/no-cover.png'
    const missingCoverAltText = this.props.intl.formatMessage(messages.missingCoverImageOf, {title: result.displayTitle})
    return (
      <div className="single-entry" data-formats={formats.join(', ')}>
        <aside className="book-cover">
          <Link to={this.getResultUrl(result)} className="book-cover-item">
            {result.image ? <img src={result.image} alt={coverAltText} /> : <img src={missingCoverImage} alt={missingCoverAltText}/>}
          </Link>
        </aside>

        <article className="entry-content">

          <div className="entry-content-icon">
            {result.mediaTypes.map(mediaType => {
              return <MediaType key={mediaType.uri} mediaType={mediaType} />
            })}
          </div>

          <h1>
            {this.renderDisplayTitle(result)}
          </h1>

          <div className="contributors">
            {this.renderContributors(result.publication.contributors)}
          </div>

          <div>
            {this.renderOriginalTitle(result.publication)}
          </div>

          {firstPublishedYear
            ? <div>
                <p><strong><FormattedMessage {...messages.firstPublished} /></strong> <span>{firstPublishedYear}</span></p>
              </div>
            : null
          }

          {result.publication.abstract
           ? <div>
               <p>{result.publication.abstract}</p>
            </div>
            : null
          }

          <div>
            {this.renderSubjects(result.publication)}
          </div>

          <div>
            {this.renderGenres(result.publication)}
          </div>

        </article>

        {this.shouldShowStatus()
          ? [ (<div key="show-more-content" className="show-more-content" onClick={this.handleShowStatusClick}>
          <p><FormattedMessage {...messages.hideStatus} /></p>
          <img src="/images/btn-red-arrow-close.svg" alt="Red arrow pointing up" />
        </div>),
          (<div key="entry-more-content" className="entry-content-more">
            {result.publication.series
              ? this.renderSeries(result.publication.series)
              : null}
            {this.renderItems(result)}
          </div>) ]
          : (<div className="show-more-content" onClick={this.handleShowStatusClick}>
          <p><FormattedMessage {...messages.showStatus} /></p>
          <img src="/images/btn-red-arrow-open.svg" alt="Red arrow pointing down" />
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
  genres: {
    id: 'SearchResult.genres',
    description: 'The text displayed to identify genres',
    defaultMessage: 'Genres:'
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
  },
  coverImageOf: {
    id: 'SearchResult.coverImageOf',
    description: 'Used for alt text in images',
    defaultMessage: 'Cover image of: {title}'
  },
  missingCoverImageOf: {
    id: 'SearchResult.missingCoverImageOf',
    description: 'Used for placeholder cover images',
    defaultMessage: 'Missing cover image of: {title}'
  },
  partOfSeries: {
    id: 'SearchResult.partOfSeries',
    description: 'Text stating that publication is part of a series',
    defaultMessage: 'Part of series: '
  }
})

export default injectIntl(SearchResult)
