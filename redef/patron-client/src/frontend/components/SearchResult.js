import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

const SearchResult = React.createClass({
  propTypes: {
    result: PropTypes.object.isRequired,
    locationQuery: PropTypes.object.isRequired,
    showMoreInfo: PropTypes.func.isRequired,
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
  handleShowMoreInfoClick (event) {
    event.stopPropagation()
    event.preventDefault()
    this.props.showMoreInfo(this.props.result.relativeUri)
  },
  shouldShowMoreInfo () {
    let { showMore } = this.props.locationQuery
    let { relativeUri } = this.props.result
    return (showMore && showMore === relativeUri || (Array.isArray(showMore) && showMore.includes(relativeUri)))
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
      <section className='single-entry' data-formats={formats.join(', ')}>
        <aside className='book-cover'>
          <Link to={result.relativeUri} className='book-cover-item' />
        </aside>

        <article className='entry-content'>

          <div className='entry-content-icon'>
            <div className='entry-content-icon-single'>
              <img src='/images/icon-audiobook.svg' alt='Black speaker with audio waves' />
              <p>Lydbok</p>
            </div>
          </div>

          <h1>
            {this.renderDisplayTitle(result)}
          </h1>

          <div className='contributors'>
            {this.renderContributors(result.contributors)}
          </div>

          <div>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget massa id mauris maximus
              porta. In dignissim, metus in elementum ultrices, erat velit gravida turpis, id efficitur
              nunc est vitae purus. Aliquam ornare efficitur tellus sit amet dapibus. Aliquam ultrices,
              sapien in volutpat vehicula, lacus nunc pretium leo, quis dignissim arcu nisl vitae velit.
              Aliquam sit amet nisl non tortor elementum consequat. Morbi id nulla ac quam luctus posuere
              nec a risus. Aenean congue quam tortor, a volutpat quam mollis nec. Nullam metus ex,
              efficitur vitae tortor vitae, imperdiet semper nisl. Mauris vel accumsan odio, venenatis
              fringilla ex.</p>
          </div>

          <div>
            {this.renderOriginalTitle(result)}
          </div>
        </article>

        {this.shouldShowMoreInfo()
          ? [ (<div key='show-more-content' className='show-more-content' onClick={this.handleShowMoreInfoClick}>
          <p>Skjul detaljer</p>
          <img src='/images/btn-search-sorting.svg' alt='Black arrow pointing down' />
        </div>),
          (<div key='entry-more-content' className='entry-content-more'>

            <div className='col' data-automation-id='work_formats'>
              <strong><FormattedMessage {...messages.availableAs} /></strong>
              <br />
              {formats.join(', ')}
            </div>

          </div>) ]
          : (<div className='show-more-content' onClick={this.handleShowMoreInfoClick}>
            <p>Vis detaljer</p>
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
  }
})

export default injectIntl(SearchResult)
