import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

import Items from '../components/Items'

const SearchResult = React.createClass({
  propTypes: {
    result: PropTypes.object.isRequired,
    locationQuery: PropTypes.object.isRequired,
    showStatus: PropTypes.func.isRequired,
    resources: PropTypes.object.isRequired,
    fetchWorkResource: PropTypes.func.isRequired,
    intl: intlShape.isRequired
  },
  componentWillMount () {
    const { relativeUri } = this.props.result
    if (this.shouldShowStatus() && !this.props.resources[ relativeUri ]) {
      this.props.fetchWorkResource(relativeUri)
    }
  },
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
  },
  renderDisplayTitle (result) {
    let displayTitle = result.mainTitle
    if (result.partTitle) {
      displayTitle += ` — ${result.partTitle}`
    }
    return (
      <Link data-automation-id='work-link' to={result.relativePublicationUri || result.relativeUri}>
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
  renderSubjects (result) {
    if (result.subjects) {
      return (
        <p data-automation-id='work_subjects'>
          <strong>
            <FormattedMessage {...messages.subjects} />
            {result.subjects.map(subject => (
              <span key={subject.searchQuery}>
                <Link to={subject.searchQuery}> {subject.name} </Link>
                </span>
            ))}
          </strong>
        </p>
      )
    }
  },
  renderItems (result) {
    const resource = this.props.resources[ result.relativeUri ]
    if (resource) {
      return <Items items={resource.items} />
    }
  },
  handleShowStatusClick (event) {
    event.stopPropagation()
    event.preventDefault()
    this.props.fetchWorkResource(this.props.result.relativeUri)
    this.props.showStatus(this.props.result.relativeUri)
  },
  shouldShowStatus () {
    const { showStatus } = this.props.locationQuery
    const { relativeUri } = this.props.result
    return (showStatus && showStatus === relativeUri || (Array.isArray(showStatus) && showStatus.includes(relativeUri)))
  },
  render () {
    const result = this.props.result

    const pubFormats = new Set()
    result.publications.forEach(publication => {
      publication.formats.forEach(format => {
        pubFormats.add(this.props.intl.formatMessage({ id: format }))
      })
    })
    const formats = [ ...pubFormats ]

    return (
      <section className='single-entry' data-formats={formats.join(', ')}>
        <aside className='book-cover'>
          <Link to={result.relativeUri} className='book-cover-item' />
        </aside>

        <article className='entry-content'>

          <div className='entry-content-icon'>
            <div className='entry-content-icon-single'>
              {/*
               <img src='/images/icon-audiobook.svg' alt='Black speaker with audio waves' />
               <p>Lydbok</p>
               */}
            </div>
          </div>

          <h1>
            {this.renderDisplayTitle(result)}
          </h1>

          <div className='contributors'>
            {this.renderContributors(result.contributors)}
          </div>

          <div>
            {/*            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget massa id mauris maximus
             porta. In dignissim, metus in elementum ultrices, erat velit gravida turpis, id efficitur
             nunc est vitae purus. Aliquam ornare efficitur tellus sit amet dapibus. Aliquam ultrices,
             sapien in volutpat vehicula, lacus nunc pretium leo, quis dignissim arcu nisl vitae velit.
             Aliquam sit amet nisl non tortor elementum consequat. Morbi id nulla ac quam luctus posuere
             nec a risus. Aenean congue quam tortor, a volutpat quam mollis nec. Nullam metus ex,
             efficitur vitae tortor vitae, imperdiet semper nisl. Mauris vel accumsan odio, venenatis
             fringilla ex.</p>
             */}
          </div>

          <div>
            {this.renderOriginalTitle(result)}
          </div>

          <div>
            {this.renderSubjects(result)}
          </div>
        </article>

        {this.shouldShowStatus()
          ? [ (<div key='show-more-content' className='show-more-content' onClick={this.handleShowStatusClick}>
          <p><FormattedMessage {...messages.hideStatus} /></p>
          <img src='/images/btn-search-sorting.svg' alt='Black arrow pointing down' />
        </div>),
          (<div key='entry-more-content' className='entry-content-more'>
            {this.renderItems(result)}
          </div>) ]
          : (<div className='show-more-content' onClick={this.handleShowStatusClick}>
          <p><FormattedMessage {...messages.showStatus} /></p>
          <img src='/images/btn-search-sorting.svg' alt='Black arrow pointing down' />
        </div>)
        }

      </section>
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
  }
})

export default injectIntl(SearchResult)
