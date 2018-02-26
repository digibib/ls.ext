import React, {PropTypes} from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import {Link} from 'react-router'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
import Items from '../components/Items'
import MediaType from '../components/MediaType'
import createPath from '../utils/createPath'
import Constants from '../constants/Constants'
import {groupByBranch, groupByMediaType} from '../utils/sorting'
import fieldQueryLink from '../utils/link'
import {connect} from 'react-redux'

import ClickableElement from '../components/ClickableElement'

class SearchResult extends React.Component {
  constructor (props) {
    super(props)
    this.handleShowStatusClick = this.handleShowStatusClick.bind(this)
    this.handleShowUnfilteredStatusClick = this.handleShowUnfilteredStatusClick.bind(this)
    this.handleEnter = this.handleEnter.bind(this)
    this.handleBranchStatus = this.handleBranchStatus.bind(this)
  }

  componentWillMount () {
    const { id } = this.props.result
    if (this.shouldShowStatus() && !this.props.resources[ id ]) {
      // NB: Not in use?
      this.props.fetchWorkResource(id)
    }
  }

  renderYear (fictionNonfiction, publicationYears, workPublicationYear, mediaTypes) {
    // A result can have multiple metiatypes (for example book and audiobook), but
    // for now we just consider one, arbritary mediatype:
    const parsedMediatype = mediaTypes[0] ? mediaTypes[0].uri.substring(34) : 'Book' // strip http://data.deichman.no/mediaType#

    let selectedYear = workPublicationYear // defaults to work publication year
    let typeOfYear = 'published'
    switch (parsedMediatype) {
      case 'Book':
        if (fictionNonfiction === 'http://data.deichman.no/fictionNonfiction#fiction') {
          if (!workPublicationYear && publicationYears.length > 0) {
            selectedYear = Math.min(...publicationYears)
          }
        } else {
          typeOfYear = 'ourLatestEdition'
          if (publicationYears.length > 0) {
            selectedYear = Math.max(...publicationYears)
          }
        }
        break
      case 'Film':
        typeOfYear = 'productionYear'
        break
      case 'SheetMusic':
        typeOfYear = 'composed'
        break
      case 'MusicRecording':
        typeOfYear = 'originallyReleased'
        if (!workPublicationYear && publicationYears.length > 0) {
          selectedYear = Math.min(...publicationYears)
        }
    }

    if (!selectedYear) {
      return
    }

    return (
        <p data-automation-id="work_or_publication_year" >
          <span>
            <strong><FormattedMessage {...messages[typeOfYear]} /></strong> {selectedYear}
          </span>
        </p>
    )
  }

  renderContributors (contributors) {
    if (contributors.length > 0) {
      return (
        <p data-automation-id="work_contributors" >{contributors.map(contribution => (
          <span key={contribution.agent.relativeUri} >
            <strong>Av</strong> <Link to={fieldQueryLink('aktør', contribution.agent.name)} >{contribution.agent.name} </Link>
          </span>
        ))}
        </p>
      )
    }
  }

  renderDisplayTitle (result) {
    return (
      <Link data-automation-id="work-link" to={this.getResultUrl(result)} >
        <h1 className="workTitle" data-automation-id="work-title" >
          { result.untranscribedTitle
            ? <span className="title-text" >{result.untranscribedTitle}</span>
            : null
          }
          <span className="title-text" >{result.title}</span>
          {this.shouldShowFullList()
            ? <span className="caret" ><i className="icon-angle-wide" aria-hidden="true" /></span>
            : null
          }
        </h1>
      </Link>
    )
  }

  renderOriginalTitle (originalTitle) {
    if (originalTitle) {
      return (
        <div className="original-title" >
          <p data-automation-id="work_originaltitle" >
            <FormattedMessage {...messages.originalTitle} /> { originalTitle }
          </p>
        </div>
      )
    }
  }

  renderSubjects (result) {
    if (result.subject) {
      return (
        <p key="pubs" className="subjects" data-automation-id="work_subjects" >
          <strong><FormattedMessage {...messages.subjects} /></strong>&nbsp;
          {result.subject.map((subject, i) => (
            <span key={subject} >
                <Link to={fieldQueryLink('emne', subject)}>{subject}</Link>{(i < result.subject.length - 1) ? ', ' : null}
                </span>
          ))}
        </p>
      )
    }
  }

  renderGenres (result) {
    if (result.genre) {
      return (
        <p key="gens" className="genres" data-automation-id="work_genres" >
          <strong><FormattedMessage {...messages.genres} /></strong>&nbsp;
          {result.genre.map((genre, i) => (
            <span key={genre} >
                <Link to={fieldQueryLink('sjanger', genre)}>{genre}</Link>{(i < result.genre.length - 1) ? ', ' : null}
                </span>
          ))}
        </p>
      )
    }
  }

  renderSeries (publication) {
    return (
      <div data-automation-id="publication_series" >
        <strong><FormattedMessage {...messages.partOfSeries} /></strong>
        <span>
          <Link to="#">Serie placeholder</Link>
        </span>
      </div>
    )
  }

  getResultItems () {
    let groupedByBranchAndMedia = []
    const { result } = this.props
    const work = this.props.resources[ result.id ]

    if (work) {
      const items = [].concat(...work.publications.map(publication => (this.props.items[ publication.recordId ] || []).items || []).filter(array => array.length > 0))
      const groupedByBranchSortedByMediaType = groupByBranch(items)

      groupedByBranchSortedByMediaType.map(el => {
        el.workId = result.id
        el.realName = this.props.intl.formatMessage({ id: el.branchcode })
        el.items.forEach(e => {
          e.mediaType = this.props.intl.formatMessage({ id: e.mediaTypes[ 0 ] })
          e.mediaTypeURI = e.mediaTypes[ 0 ]
        })

        el.items.sort((a, b) => {
          if (a.mediaType < b.mediaType) return -1
          if (a.mediaType > b.mediaType) return 1

          return 0
        })

        return el
      })

      groupedByBranchSortedByMediaType.sort((a, b) => {
        if (a.realName < b.realName) return -1
        if (a.realName > b.realName) return 1
        return 0
      })

      groupedByBranchAndMedia = groupedByBranchSortedByMediaType.map(el => {
        el.mediaItems = groupByMediaType(el.items)
        return el
      })
    }

    let remainingBranches = []
    const groupedByBranchAndMediaLangFiltered = this.extractBranchesByLang(groupedByBranchAndMedia)
    const groupedByBranchAndMediaMediaFiltered = this.extractBranchesByMedia(groupedByBranchAndMedia)

    if (groupedByBranchAndMediaLangFiltered.length > 0 && groupedByBranchAndMediaMediaFiltered.length > 0) {
      const mediaAndLangFiltered = this.extractBranchesByMedia(groupedByBranchAndMediaLangFiltered)
      remainingBranches = this.extractRemainingBranches(groupedByBranchAndMedia, mediaAndLangFiltered)
      return [ mediaAndLangFiltered, remainingBranches ]
    } else if (groupedByBranchAndMediaLangFiltered.length > 0) {
      remainingBranches = this.extractRemainingBranches(groupedByBranchAndMedia, groupedByBranchAndMediaLangFiltered)
      return [ groupedByBranchAndMediaLangFiltered, remainingBranches ]
    } else if (groupedByBranchAndMediaMediaFiltered.length > 0) {
      remainingBranches = this.extractRemainingBranches(groupedByBranchAndMedia, groupedByBranchAndMediaMediaFiltered)
      return [ groupedByBranchAndMediaMediaFiltered, remainingBranches ]
    } else {
      return [ groupedByBranchAndMedia, [] ]
    }
  }

  extractRemainingBranches (groupedByBranchAndMedia, filtered) {
    return groupedByBranchAndMedia.filter((current) => {
      return filtered.filter((currentB) => {
        return currentB.branchcode === current.branchcode
      }).length === 0
    })
  }

  extractBranchesByMedia (groupedByBranchAndMedia) {
    const activeMediaFilters = this.getActiveFilters('mediatype')
    const groupedByBranchAndMediaFiltered = []

    /* If media filter is set, than filter out branches which do not contain selected media */
    if (activeMediaFilters.length > 0) {
      groupedByBranchAndMedia.map(el => {
        el.mediaItems.map(mEl => {
          activeMediaFilters.forEach(mf => {
            if (mEl.mediaTypeURI === mf.bucket) {
              let repBranchCode = false
              groupedByBranchAndMediaFiltered.forEach(arrayEl => {
                if (arrayEl.branchcode === el.branchcode) {
                  repBranchCode = true
                }
              })
              if (!repBranchCode) {
                groupedByBranchAndMediaFiltered.push(el)
              }
            }
          })
          return mEl
        })
        return el
      })
    }
    return groupedByBranchAndMediaFiltered
  }

  extractBranchesByLang (groupedByBranchAndMedia) {
    const activeLangFilters = this.getActiveFilters('language')
    const groupedByBranchAndMediaFiltered = []

    /* If lang filter is set, than filter out branches which do not contain selected lang */
    if (activeLangFilters.length > 0) {
      groupedByBranchAndMedia.map(el => {
        el.mediaItems.map(mEl => {
          mEl.items.map(i => {
            activeLangFilters.forEach(l => {
              if (i.languages[ 0 ] === l.bucket) {
                let repBranchCode = false
                groupedByBranchAndMediaFiltered.forEach(arrayEl => {
                  if (arrayEl.branchcode === el.branchcode) {
                    repBranchCode = true
                  }
                })
                if (!repBranchCode) {
                  groupedByBranchAndMediaFiltered.push(el)
                }
              }
            })
            return i
          })
          return mEl
        })
        return el
      })
    }
    return groupedByBranchAndMediaFiltered
  }

  getResultUrl (result) {
    const { pathname, search, hash } = window.location
    return createPath({
      pathname: result.relativePublicationUri || result.relativeUri,
      query: { back: `${pathname}${search}${hash}` }
    })
  }

  getActiveFilters (filterKey) {
    const activeFilters = []
    this.props.filters.map(el => {
      if (el.id.includes(filterKey) && el.active) {
        activeFilters.push(el)
      }
      return el
    })
    return activeFilters
  }

  renderItems (groupedByBranchAndMedia) {
    let homeBranchPos
    let defaultBranchPos
    const activeFilters = this.getActiveFilters('branch')

    if (groupedByBranchAndMedia.length > 0) {
      const byBranch = groupedByBranchAndMedia.map((el, i) => {
        /* Check if any branch filters selected and if user has homeBranch and remember position of homeBranch */
        if (this.props.homeBranch && this.props.homeBranch === el.branchcode && activeFilters.length === 0) {
          homeBranchPos = i
        }
        /* Check if any branch filters selected and remember position of main branch */
        if (el.branchcode === 'hutl' && activeFilters.length === 0) {
          defaultBranchPos = i
        }
        return (
          <div className="items-by-branch" key={el.branchcode} >
            <ClickableElement onClickAction={this.handleBranchStatus} onClickArguments={el.branchcode} >
              <div className="flex-wrapper branch-header" >
                <div className="flex-item" >
                  <h1>{this.props.intl.formatMessage({ id: el.branchcode })}</h1>
                </div>
                <div className="flex-item item-icon-button" >
                  <ClickableElement onClickAction={this.handleBranchStatus} onClickArguments={el.branchcode} >
                    <button className="flex-item" >
                      {this.shouldShowBranchStatus(el.branchcode, groupedByBranchAndMedia.length)
                        ? [ (<span key={`show-less-content${el.branchcode}`} className="is-vishidden" >
                          <FormattedMessage {...messages.showBranchAvailability} />
                        </span>), (<img className="icon" src="images/minus.svg" key={`show-less-content-icon${el.branchcode}`}
                                      aria-hidden="true" />) ]
                        : [ (<span key={`show-more-content${el.branchcode}`} className="is-vishidden" >
                        <FormattedMessage {...messages.hideBranchAvailability} />
                        </span>), (<img className="icon" src="images/plus.svg" key={`show-more-content-icon${el.branchcode}`}
                                      aria-hidden="true" />) ]
                      }
                    </button>
                  </ClickableElement>
                </div>
              </div>
            </ClickableElement>
            {this.shouldShowBranchStatus(el.branchcode, groupedByBranchAndMedia.length)
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

      byBranch.map((el, i) => {
        activeFilters.forEach(a => {
          if (el.key === a.bucket) {
            const activeBranch = byBranch.splice(i, 1)
            byBranch.unshift(activeBranch)
          }
        })
      })

      if (homeBranchPos) {
        const userBranch = byBranch.splice(homeBranchPos, 1)
        byBranch.unshift(userBranch)
      }

      if (defaultBranchPos && !homeBranchPos) {
        const defaultBranch = byBranch.splice(defaultBranchPos, 1)
        byBranch.unshift(defaultBranch)
      }

      return byBranch
    }
  }

  handleBranchStatus (code) {
    this.props.showBranchStatus(code)
  }

  shouldShowBranchStatus (code, numberOfBranches) {
    let showOneBranch = false
    const { locationQuery: { showBranchStatus, showBranchStatusSingle } } = this.props
    if (numberOfBranches === 1) {
      showOneBranch = showBranchStatusSingle && showBranchStatusSingle === code ||
        (Array.isArray(showBranchStatusSingle) && showBranchStatusSingle.includes(code))
    }
    return showBranchStatus && showBranchStatus === code || (Array.isArray(showBranchStatus) && showBranchStatus.includes(code)) || showOneBranch
  }

  handleShowStatusClick (event) {
    event.stopPropagation()
    this.props.fetchWorkResource(this.props.result.id)
    this.props.showStatus(this.props.result.id)
  }

  handleShowUnfilteredStatusClick (event) {
    event.stopPropagation()
    this.props.showUnfilteredStatus(this.props.result.id)
  }

  handleEnter (event) {
    if (event.keyCode === 32) { // Space code
      event.preventDefault()
      this.handleShowStatusClick(event)
    }
  }

  shouldShowFullList () {
    const { locationQuery: { showFullList } } = this.props
    return (showFullList === null)
  }

  shouldShowStatus () {
    const { locationQuery: { showStatus }, result: { id } } = this.props
    return (showStatus && showStatus === id || (Array.isArray(showStatus) && showStatus.includes(id)))
  }

  shouldShowUnfilteredStatus () {
    const { locationQuery: { showUnfilteredStatus }, result: { id } } = this.props
    return (showUnfilteredStatus && showUnfilteredStatus === id || (Array.isArray(showUnfilteredStatus) && showUnfilteredStatus.includes(id)))
  }

  render () {
    const { result } = this.props
    const pubFormats = new Set()
    result.formats.forEach(format => {
      pubFormats.add(this.props.intl.formatMessage({ id: format }))
    })

    const formats = [ ...pubFormats ]
    const coverAltText = this.props.intl.formatMessage(messages.coverImageOf, { title: result.titleLine1 })
    const missingCoverAltText = this.props.intl.formatMessage(messages.missingCoverImageOf, { title: result.displayTitle })
    const mediaTypeURI = result.mediaTypes[ 0 ] ? result.mediaTypes[ 0 ].uri : ''

    // Contains two arrays: one array for filtered branches and one array for branches excluded from filter criteria
    const groupedByBranchAndMedia = this.getResultItems()
    // console.log('shouldShowFullList', this.shouldShowFullList())
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
        <div className="entry-header">
          {this.shouldShowFullList()
            ? <aside className={result.image ? 'book-cover' : 'book-cover missing'} aria-hidden="true" >
              <Link to={this.getResultUrl(result)} className="book-cover-item" tabIndex="-1" >
                {result.image ? <img src={result.image} alt={coverAltText} />
                  : <img aria-label={missingCoverAltText}
                       src={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ mediaTypeURI ] ]} />}
              </Link>
            </aside>
            : null
          }

          <article className="entry-content" >

            <div className="entry-content-icon" >
              {/* <FormattedMessage {...messages.availableAs} /> */}
              {result.mediaTypes.map(mediaType => {
                return <MediaType key={mediaType.uri} mediaType={mediaType} />
              }).sort((x, y) => { return x.key === 'http://data.deichman.no/mediaType#Book' ? -1 : y.key === 'http://data.deichman.no/mediaType#Book' ? 1 : 0 })
              }
            </div>

            {this.renderDisplayTitle(result)}
            {this.renderContributors(result.contributors)}
            {this.renderOriginalTitle(result.originalTitle)}
            {this.renderYear(result.fictionNonfiction, result.publicationYears || [], result.workPublicationYear, result.mediaTypes || [])}

            {result.abstract
              ? <p className="abstract" >{result.abstract}</p>
              : null
            }
            {this.shouldShowFullList()
              ? [ this.renderSubjects(result), this.renderGenres(result) ]
              : null
            }

          {this.shouldShowStatus()
            ? (<div key="show-more-content" className="show-more-content" onClick={this.handleShowStatusClick}
                      onKeyDown={this.handleEnter} >
                <p><a role="button" tabIndex="0" aria-expanded="true" ><FormattedMessage {...messages.showStatus} /></a></p>
                <img src="/images/arrow_up.svg" alt="arrow up" aria-hidden="true" />
              </div>)
            : (<div className="show-more-content" onClick={this.handleShowStatusClick} onKeyDown={this.handleEnter} >
              <p><a role="button" tabIndex="0" aria-expanded="false" ><FormattedMessage {...messages.showStatus} /></a>
              </p>
              <img src="/images/arrow_down.svg" alt="arrow down" aria-hidden="true" />
            </div>)
          }
          </article>

        </div>
          {this.shouldShowStatus()
            ? [ (<div key="entry-more-content" className="entry-content-more" >
                {this.renderItems(groupedByBranchAndMedia[ 0 ])}
              </div>),
              (<span key="entry-more-content-unfiltered-wrapper" >{groupedByBranchAndMedia[ 1 ].length
                ? (<div key="entry-more-content-unfiltered" onClick={this.handleShowUnfilteredStatusClick}
                        onKeyDown={this.handleEnter} >
                  {this.shouldShowUnfilteredStatus()
                    ? [ (<div key="show-more-unfiltered-content" className="show-more-content" >
                      <p><a role="button" tabIndex="0"
                            aria-expanded="true" ><FormattedMessage {...messages.hideRestOfBranches} /></a></p>
                      <img src="/images/minus.svg" alt="minus sign" aria-hidden="true" />
                    </div>),
                      (<div key="show-more-unfiltered-content-items"
                            className="entry-content-more" >{this.renderItems(groupedByBranchAndMedia[ 1 ])}</div>) ]
                    : (<div className="show-more-content" onClick={this.handleShowUnfilteredStatusClick}
                            onKeyDown={this.handleEnter} >
                      <p><a role="button" tabIndex="0"
                            aria-expanded="false" ><FormattedMessage {...messages.restOfBranches} /></a></p>
                      <img src="/images/minus.svg" alt="minus sign" aria-hidden="true" />
                    </div>)
                  }
                </div>)
                : null
              }</span>)
            ]
            : null
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
  homeBranch: PropTypes.string,
  filters: PropTypes.array.isRequired,
  showBranchStatusMedia: PropTypes.func.isRequired,
  showBranchStatus: PropTypes.func.isRequired,
  showUnfilteredStatus: PropTypes.func.isRequired
}

export const messages = defineMessages({
  published: {
    id: 'SearchResult.published',
    description: 'Label for Published',
    defaultMessage: 'Published'
  },
  ourLatestEdition: {
    id: 'SearchResult.ourLatestEdition',
    description: 'Label for Our Latest Edition',
    defaultMessage: 'Our Latest Edition'
  },
  originallyReleased: {
    id: 'SearchResult.originallyReleased',
    description: 'Label for Originally released',
    defaultMessage: 'Originally Released'
  },
  composed: {
    id: 'SearchResult.composed',
    description: 'Label for Composed',
    defaultMessage: 'Composed'
  },
  productionYear: {
    id: 'SearchResult.productionYear',
    description: 'Label for Production year',
    defaultMessage: 'Production year'
  },
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
    defaultMessage: 'Find it here'
  },
  hideRestOfBranches: {
    id: 'SearchResult.hideRestOfBranches',
    description: 'Hide the rest of branches which do not meet filter criteria',
    defaultMessage: 'Hide other branches'
  },
  restOfBranches: {
    id: 'SearchResult.restOfBranches',
    description: 'Shown the rest of branches which do not meet filter criteria',
    defaultMessage: 'Show other branches'
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

export {intlSearchResult as SearchResult}

export default intlSearchResult

// export default injectIntl(SearchResult)
