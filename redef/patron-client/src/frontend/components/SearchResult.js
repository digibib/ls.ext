import React, {PropTypes} from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import {Link} from 'react-router'
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl'
import Items from '../components/Items'
import MediaType from '../components/MediaType'
import createPath from '../utils/createPath'
import Constants from '../constants/Constants'
import { groupByBranch, groupByMediaType } from '../utils/sorting'
import fieldQueryLink from '../utils/link'
import { connect } from 'react-redux'

class SearchResult extends React.Component {
  constructor (props) {
    super(props)
    this.handleShowStatusClick = this.handleShowStatusClick.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
  }

  componentWillMount () {
    const { id } = this.props.result
    if (this.shouldShowStatus() && !this.props.resources[ id ]) {
      this.props.fetchWorkResource(id)
    }
  }


  scrollToTop () {
    window.scrollTo(0, 0)
  }

  renderContributors (contributors) {
    if (contributors.length > 0) {
      return (
        <p data-automation-id="work_contributors">{contributors.map(contribution => (
          <span key={contribution.agent.relativeUri}>
            {/* <strong>{this.props.intl.formatMessage({ id: contribution.role })}</strong> */}
            <strong>Av</strong>
            <Link to={fieldQueryLink('aktør', contribution.agent.name)}> {contribution.agent.name} </Link>
          </span>
        ))}
        </p>
      )
    }
  }

  renderDisplayTitle (result) {
    return (
      <Link data-automation-id="work-link" to={this.getResultUrl(result)}>
        <h1 className="workTitle" data-automation-id="work-title">
          <span className="title-text">{result.title}</span>
          <span className="caret"><i className="icon-angle-wide" aria-hidden="true" /></span>
        </h1>
      </Link>
    )
  }

  renderOriginalTitle (publication) {
    if (publication.originalTitle) {
      return (
        <div className="original-title">
          <p data-automation-id="work_originaltitle">
            <FormattedMessage {...messages.originalTitle} /> {publication.originalTitle}
          </p>
        </div>
      )
    }
  }

  renderSubjects (result) {
    if (result.subject) {
      return (
        <p className="subjects" data-automation-id="work_subjects">
          <strong><FormattedMessage {...messages.subjects} /></strong><br />
          {result.subject.map((subject, i) => (
            <span key={subject}>
                <Link
                  to={fieldQueryLink('emne', subject)}
                  onClick={this.scrollToTop}> {subject} </Link> {(i < result.subject.length - 1) ? '|' : null}
                </span>
          ))}
        </p>
      )
    }
  }

  renderGenres (result) {
    if (result.genre) {
      return (
        <p className="genres" data-automation-id="work_genres">
          <strong><FormattedMessage {...messages.genres} /></strong><br />
          {result.genre.map((genre, i) => (
            <span key={genre}>
                <Link to={fieldQueryLink('sjanger', genre)}
                      onClick={this.scrollToTop}> {genre} </Link> {(i < result.genre.length - 1) ? '|' : null}
                </span>
          ))}
        </p>
      )
    }
  }

  renderSeries (publication) {
    return (
      <div data-automation-id="publication_series">
        <strong><FormattedMessage {...messages.partOfSeries} /></strong>
        <span>
          <Link to="#" onClick={this.scrollToTop}>Serie placeholder</Link>
        </span>
      </div>
    )

    // TOO: When series information is available ...
    /*
     return (
     <div data-automation-id="publication_series">
     <strong><FormattedMessage {...messages.partOfSeries} /></strong>
     {publication.series.map((serie, i) => (
     <span key={serie}>
     <Link to={this.seriesSearchLink(serie)} onClick={this.scrollToTop}> {serie} </Link> {(i < series.length - 1) ? '|' : null}
     </span>
     ))}
     </div>
     )
     */
  }

  getResultUrl (result) {
    const { pathname, search, hash } = window.location
    return createPath({
      pathname: result.relativePublicationUri || result.relativeUri,
      query: { back: `${pathname}${search}${hash}` }
    })
  }

  getActiveBranchFilters () {
    let activeBranches = []
    this.props.filters.map(el => {
      if (el.id.includes('branch') && el.active) {
        activeBranches.push(el)
      }
      return el
    })
    return activeBranches
  }

  renderItems (result) {
    let homeBranchPos
    const work = this.props.resources[ result.id ]
    const activeFilters = this.getActiveBranchFilters()

    if (work) {
      const items = [].concat(...work.publications.map(publication => (this.props.items[ publication.recordId ] || []).items || []).filter(array => array.length > 0))

      const groupedByBranchSortedByMediaType = groupByBranch(items)

      groupedByBranchSortedByMediaType.map(el => {
        el.items.forEach(e => {
          e.mediaType = this.props.intl.formatMessage({ id: e.mediaTypes[0] })
          e.mediaTypeURI = e.mediaTypes[0]
        })

        el.items.sort((a, b) => {
          if (a.mediaType < b.mediaType) return -1
          if (a.mediaType > b.mediaType) return 1

          return 0
        })
        return el
      })

      const groupedByBranchAndMedia = groupedByBranchSortedByMediaType.map(el => {
        el.mediaItems = groupByMediaType(el.items)
        return el
      })

      const byBranch = groupedByBranchAndMedia.map((el, i) => {
        if (this.props.homeBranch && this.props.homeBranch === el.branchcode && activeFilters.length === 0) {
          homeBranchPos = i
        }

        return (
          <div className="items-by-branch" key={el.branchcode}>
            <div className="flex-wrapper branch-header" onClick={() => { this.handleBranchStatus(el.branchcode) }}>
              <div className="flex-item">
                <h1>{this.props.intl.formatMessage({ id: el.branchcode })}</h1>
              </div>
              <div className="flex-item item-icon-button">
                  <button className="flex-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    this.handleBranchStatus(el.branchcode)
                  }}
                  onKeyDown={() => { this.handleBranchStatusEnter(el.branchcode) }}>
                    {this.shouldShowBranchStatus(el.branchcode)
                      ? [(<span key={`show-less-content${el.branchcode}`} className="is-vishidden">
                        <FormattedMessage {...messages.showBranchAvailability} />
                      </span>), (<i key={`show-less-content-icon${el.branchcode}`} className="icon-up-open" aria-hidden="true" />)]
                      : [(<span key={`show-more-content${el.branchcode}`} className="is-vishidden">
                      <FormattedMessage {...messages.hideBranchAvailability} />
                      </span>), (<i key={`show-more-content-icon${el.branchcode}`} className="icon-down-open" aria-hidden="true" />)]
                    }
                  </button>
                </div>
            </div>
            {this.shouldShowBranchStatus(el.branchcode)
              ? <Items
                mediaItems={el.mediaItems}
                showBranchStatusMedia={this.props.showBranchStatusMedia}
                branchCode={el.branchcode}
                locationQuery={this.props.locationQuery}
                userBranch={this.props.homeBranch}
                activeFilters={activeFilters}
              />
              : null
            }
          </div>
        )
      })

      if (homeBranchPos) {
        const userBranch = byBranch.splice(homeBranchPos, 1)
        byBranch.unshift(userBranch)
      }

      return byBranch
    }
  }

  handleBranchStatus (code) {
    this.props.showBranchStatus(code)
  }

  handleBranchStatusEnter (code) {
    if (event.keyCode === 32) { // Space code
      event.preventDefault()
      this.handleBranchStatus(code)
    }
  }

  shouldShowBranchStatus (code) {
    const { locationQuery: { showBranchStatus } } = this.props
    return (showBranchStatus && showBranchStatus === code || (Array.isArray(showBranchStatus) && showBranchStatus.includes(code)))
  }

  handleShowStatusClick (event) {
    event.stopPropagation()
    this.props.fetchWorkResource(this.props.result.id)
    this.props.showStatus(this.props.result.id)
  }

  handleEnter (event) {
    if (event.keyCode === 32) { // Space code
      event.preventDefault()
      this.handleShowStatusClick(event)
    }
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
    const pubFormats = new Set()
    result.publication.formats = result.publication.formats || []
    result.publication.formats.forEach(format => {
      pubFormats.add(this.props.intl.formatMessage({ id: format }))
    })

    const formats = [ ...pubFormats ]
    const coverAltText = this.props.intl.formatMessage(messages.coverImageOf, { title: result.titleLine1 })
    const missingCoverAltText = this.props.intl.formatMessage(messages.missingCoverImageOf, { title: result.displayTitle })
    const mediaTypeURI = result.mediaTypes[ 0 ] ? result.mediaTypes[ 0 ].uri : ''
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="single-entry"
        data-formats={formats.join(', ')}>
        <aside className="book-cover" aria-hidden="true">
          <Link to={this.getResultUrl(result)} className="book-cover-item" tabIndex="-1">
            {result.image ? <img src={result.image} alt={coverAltText} />
              : <i aria-label={missingCoverAltText}
                   className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ mediaTypeURI ] ]} />}
          </Link>
        </aside>

        <article className="entry-content">

          <div className="entry-content-icon">
            <FormattedMessage {...messages.availableAs} />
            {result.mediaTypes.map(mediaType => {
              return <MediaType key={mediaType.uri} mediaType={mediaType} />
            })}
          </div>

          {this.renderDisplayTitle(result)}
          {this.renderContributors(result.publication.contributors)}
          {this.renderOriginalTitle(result.publication)}
          {/* this.renderSeries(result.publication) */}
          {result.publication.abstract
            ? <p className="abstract">{result.publication.abstract}</p>
            : null
          }

          {this.renderSubjects(result.publication)}
          {this.renderGenres(result.publication)}
        </article>

        {this.shouldShowStatus()
          ? [ (<div key="show-more-content" className="show-more-content" onClick={this.handleShowStatusClick} onKeyDown={this.handleEnter}>
            <p><a role="button" tabIndex="0" aria-expanded="true"><FormattedMessage {...messages.hideStatus} /></a></p>
          <img src="/images/btn-red-arrow-close.svg" alt="Red arrow pointing up" aria-hidden="true" />
        </div>),
          (<div key="entry-more-content" className="entry-content-more">
            {this.renderItems(result)}
          </div>) ]
          : (<div className="show-more-content" onClick={this.handleShowStatusClick} onKeyDown={this.handleEnter}>
            <p><a role="button" tabIndex="0" aria-expanded="false"><FormattedMessage {...messages.showStatus} /></a></p>
          <img src="/images/btn-red-arrow-open.svg" alt="Red arrow pointing down" aria-hidden="true" />
        </div>)
        }

      </NonIETransitionGroup>
    )
  }
}

SearchResult.propTypes = {
  result: PropTypes.object.isRequired,
  locationQuery: PropTypes.object.isRequired,
  showStatus: PropTypes.func.isRequired,
  resources: PropTypes.object.isRequired,
  fetchWorkResource: PropTypes.func.isRequired,
  items: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  homeBranch: PropTypes.string
}

export const messages = defineMessages({
  showBranchAvailability: {
    id: 'SearchResult.showBranchAvailability',
    description: 'Label for icon button showing availability info in branch',
    defaultMessage: 'Show branch availability'
  },
  hideBranchAvailability: {
    id: 'SearchResult.hideBranchAvailability',
    description: 'Label for icon button collapsing availability info in branch',
    defaultMessage: 'Hide branch availability'
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
    defaultMessage: 'Where can you find this'
  },
  hideStatus: {
    id: 'SearchResult.hideStatus',
    description: 'Shown when the status is shown',
    defaultMessage: 'Hide availability'
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

function mapStateToProps (state) {
  return {
    filters: state.search.filters
  }
}

let intlSearchResult = injectIntl(SearchResult)

intlSearchResult = connect(
  mapStateToProps
)(intlSearchResult)

export { intlSearchResult as SearchResult }

export default intlSearchResult

// export default injectIntl(SearchResult)
