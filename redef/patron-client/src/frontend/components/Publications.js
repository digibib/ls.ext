import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl'
import MediaQuery from 'react-responsive'
import firstBy from 'thenby'
import NonIETransitionGroup from './NonIETransitionGroup'
import Publication from './Publication'
import PublicationInfo from './PublicationInfo'
import {getId, getFragment} from '../utils/uriParser'
import ClickableElement from './ClickableElement'
import {getCategorizedFilters} from '../utils/filterParser'
import Constants from '../constants/Constants'
import ShowFilteredPublicationsLabel from '../components/ShowFilteredPublicationsLabel'
import SearchFilterBox from '../components/SearchFilterBox'
import MediaType from '../components/MediaType'

class Publications extends React.Component {
  constructor (props) {
    super(props)
    this.mediaTypeUri = {}
    this.handleAnchorClick = this.handleAnchorClick.bind(this)
  }

  componentWillMount () {
    if (this.props.publications.length === 1) {
      this.props.expandSubResource(this.props.publications[ 0 ].id, true)
    }
  }

  renderEmpty () {
    return (
      <h2 data-automation-id="no_publications">
        <FormattedMessage {...messages.noPublications} />
      </h2>
    )
  }

  isArraysIntersecting (array1, array2) {
    return array1.some((item) => array2.includes(item))
  }

  generatePublicationRows (publicationRows) {
    return publicationRows.map((publications, row) => {
      const showMorePublication = publications.find(publication => getId(publication.uri) === this.props.locationQuery.showMore)
      const output = [ <div key={`row-${row}`} className="row">{publications.map(publication => (
        <Publication
          startReservation={this.props.startReservation}
          key={publication.id}
          expandSubResource={this.props.expandSubResource}
          publication={publication}
          open={publication === showMorePublication}
        />
      ))}</div> ]
      if (showMorePublication) {
        output.push(
          <div className="row" key={showMorePublication.id}>
            <PublicationInfo expandSubResource={this.props.expandSubResource}
                             publication={showMorePublication}
                             startReservation={this.props.startReservation}
                             query={this.props.query} />
          </div>
        )
      }
      return output
    })
  }

  renderPublications (publications, publicationsPerRow) {
    const publicationsCopy = [ ...publications ]
    let filteredPublications = []
    const filteredPublicationsRest = []
    const filters = getCategorizedFilters(this.props.locationQuery)
    if (filters.branch || filters.language || filters.format) {
      publicationsCopy.forEach(publication => {
        const formats = filters.format
        const languages = filters.language
        const branches = []
        if (filters.branch) {
          filters.branch.forEach((branch) => {
            branches.push(this.props.libraries[ branch ])
          })
        }
        const branchesFromPublication = []
        for (let i = 0; i < publication.items.length; i++) {
          branchesFromPublication.push(this.props.intl.formatMessage({ id: publication.items[ i ].branchcode }))
        }
        ((formats ? this.isArraysIntersecting(formats, publication.formats) : true) &&
          (languages ? this.isArraysIntersecting(languages, publication.languages) : true) &&
          (branches.length > 0 ? this.isArraysIntersecting(branches, branchesFromPublication) : true))
          ? filteredPublications.push(publication) : filteredPublicationsRest.push(publication)
      })
    } else {
      filteredPublications = publicationsCopy
    }
    const publicationRows = []
    const publicationRestRows = []
    while (filteredPublications.length > 0) {
      publicationRows.push(filteredPublications.splice(0, publicationsPerRow))
    }
    while (filteredPublicationsRest.length > 0) {
      publicationRestRows.push(filteredPublicationsRest.splice(0, publicationsPerRow))
    }
    return (
      <section className="work-publications" data-automation-id="work_publications">
        {this.generatePublicationRows(publicationRows)}
        {(() => {
          if (publicationRestRows.length > 0) {
            console.log('restrows', publicationRestRows[ 0 ])
            let mediaType
            let mediaTypeOutput
            if (publicationRestRows[ 0 ][ 0 ].mediaTypes[ 0 ]) {
              mediaType = Constants.mediaTypeIcons[ publicationRestRows[ 0 ][ 0 ].mediaTypes[ 0 ] ]
              mediaTypeOutput = this.props.intl.formatMessage({ id: publicationRestRows[ 0 ][ 0 ].mediaTypes[ 0 ] })
            } else {
              mediaType = 'uncategorized'
              mediaTypeOutput = this.props.intl.formatMessage({ id: messages.noMediaType.id })
            }
            let showingRestLabel = <FormattedMessage {...messages.showRestOfPublications}
                                                     values={{ mediaType: mediaTypeOutput }} />
            const output = []
            const showAll = Array.isArray(this.props.locationQuery.showAllResults) ? this.props.locationQuery.showAllResults : [ this.props.locationQuery.showAllResults ]
            if (showAll.includes(mediaType)) {
              output.push(this.generatePublicationRows(publicationRestRows))
              showingRestLabel =
                <FormattedMessage {...messages.hideRestOfPublications} values={{ mediaType: mediaTypeOutput }} />
            }
            output.push(<ShowFilteredPublicationsLabel
              open={showAll.includes(mediaType)}
              showingRestLabel={showingRestLabel} mediaType={mediaType}
              toggleParameterValue={this.props.toggleParameterValue} />)
            return output
          }
        })()}
      </section>
    )
  }

  renderPublicationsMediaQueries (publications) {
    return (
      <div key={publications}>
        <MediaQuery query="(min-width: 992px)" values={{ ...this.props.mediaQueryValues }}>
          {this.renderPublications(publications, 3)}
        </MediaQuery>
        <MediaQuery query="(min-width: 668px) and (max-width: 991px)" values={{ ...this.props.mediaQueryValues }}>
          {this.renderPublications(publications, 2)}
        </MediaQuery>
        <MediaQuery query="(max-width: 667px)" values={{ ...this.props.mediaQueryValues }}>
          {this.renderPublications(publications, 1)}
        </MediaQuery>
      </div>
    )
  }

  getPublicationHolder (publication) {
    return {
      original: publication,
      languages: publication.languages.map(language => this.props.intl.formatMessage({ id: language })),
      formats: publication.formats.map(format => this.props.intl.formatMessage({ id: format }))
    }
  }

  getSortedPublicationHolders () {
    const exceptions = {
      'http://lexvo.org/id/iso639-3/nob': 1,
      'http://lexvo.org/id/iso639-3/nno': 2,
      'http://lexvo.org/id/iso639-3/nor': 3,
      'http://lexvo.org/id/iso639-3/eng': 4,
      'http://lexvo.org/id/iso639-3/swe': 5,
      'http://lexvo.org/id/iso639-3/dan': 6
    }

    const { workLanguage } = this.props
    if (!exceptions[ workLanguage ]) {
      exceptions[ workLanguage ] = 7
    }

    const publicationHoldersByMediaType = {}
    this.props.publications.forEach(publication => {
      if (publication.mediaTypes.length > 0) {
        publication.mediaTypes.forEach(mediaTypeUri => {
          publicationHoldersByMediaType[ mediaTypeUri ] = publicationHoldersByMediaType[ mediaTypeUri ] || []
          publicationHoldersByMediaType[ mediaTypeUri ].push(this.getPublicationHolder(publication))
        })
      } else {
        publicationHoldersByMediaType[ messages.noMediaType.id ] = publicationHoldersByMediaType[ messages.noMediaType.id ] || []
        publicationHoldersByMediaType[ messages.noMediaType.id ].push(this.getPublicationHolder(publication))
      }
    })
    Object.keys(publicationHoldersByMediaType).forEach(mediaTypeUri => {
      publicationHoldersByMediaType[ mediaTypeUri ].sort(
        firstBy((a, b) => {
          if (!a.languages[ 0 ]) {
            // No languages, sort to back
            return 1
          } else if (exceptions[ a.original.languages[ 0 ] ] && exceptions[ b.original.languages[ 0 ] ]) {
            // If both items are exceptions
            return exceptions[ a.original.languages[ 0 ] ] - exceptions[ b.original.languages[ 0 ] ]
          } else if (exceptions[ a.original.languages[ 0 ] ]) {
            // Only `a` is in exceptions, sort it to front
            return -1
          } else if (exceptions[ b.original.languages[ 0 ] ]) {
            // Only `b` is in exceptions, sort it to back
            return 1
          } else {
            // No exceptions to account for, return alphabetic sort
            return a.languages[ 0 ].localeCompare(b.languages[ 0 ])
          }
        })
          .thenBy((a, b) => b.original.publicationYear - a.original.publicationYear)
          .thenBy((a, b) => (a.formats[ 0 ] || '').localeCompare(b.formats[ 0 ]))
          .thenBy((a, b) => a.original.mainTitle.localeCompare(b.original.mainTitle))
      )
    })

    const sortedPublicationHoldersByMediaType = {}
    Object.keys(publicationHoldersByMediaType).sort((a, b) => a.localeCompare(b)).forEach(field => sortedPublicationHoldersByMediaType[ field ] = publicationHoldersByMediaType[ field ])
    return sortedPublicationHoldersByMediaType
  }

  handleAnchorClick (mediaTypeUri) {
    ReactDOM.findDOMNode(this.mediaTypeUri[ mediaTypeUri ]).scrollIntoView()
  }

  renderMediaTypeAnchors (publicationHoldersByMediaType) {
    return (
      <div className="mediatype-selector">
        {
          Object.keys(publicationHoldersByMediaType).map(mediaTypeUri => {
            const mediaType = { uri: mediaTypeUri }
            return (
              <ClickableElement onClickAction={this.handleAnchorClick} onClickArguments={[ mediaTypeUri ]}
                                key={mediaTypeUri}>
                <div><MediaType key={mediaTypeUri} mediaType={mediaType} buttonRole={'button'} buttonTabIndex={'0'} /></div>
              </ClickableElement>
            )
          })
        }
      </div>
    )
  }

  render () {
    const publicationHoldersByMediaType = this.getSortedPublicationHolders()
    let { locationQuery: { collapsePublications } } = this.props
    if (!Array.isArray(collapsePublications)) {
      collapsePublications = [ collapsePublications ]
    }
    if (this.props.publications.length === 0) {
      return this.renderEmpty()
    }

    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="other-publications">
        <header>
          <h2>Gå til</h2>
          {this.renderMediaTypeAnchors(publicationHoldersByMediaType)}
          <SearchFilterBox toggleFilter={this.props.searchFilterActions.removeFilterInBackUrl}
                           query={this.props.query} />
        </header>
        {
          Object.keys(publicationHoldersByMediaType).map(mediaTypeUri => {
            const mediaTypeFragment = getFragment(mediaTypeUri)
            return (
              <section className="mediatype-group" ref={e => this.mediaTypeUri[ mediaTypeUri ] = e} key={mediaTypeUri}
                       data-automation-id="mediaType_group" data-mediatype={mediaTypeUri}>
                <header className="other-publications-title">
                  <ClickableElement
                    onClickAction={this.props.toggleParameterValue}
                    onClickArguments={[ 'collapsePublications', mediaTypeFragment ]}>
                    <h2 role="button" tabIndex="0" aria-expanded={!collapsePublications.includes(mediaTypeFragment)}>
                      <i className={Constants.mediaTypeIconsMap[ Constants.mediaTypeIcons[ mediaTypeUri ] ]} aria-hidden="true" />
                      {this.props.intl.formatMessage({ id: mediaTypeUri })}
                      {collapsePublications.includes(mediaTypeFragment)
                        ? <i className="icon-down-open last" aria-hidden="true" />
                        : <i className="icon-up-open last" aria-hidden="true" />}
                    </h2>
                  </ClickableElement>
                </header>
                <NonIETransitionGroup
                  transitionName="fade-in"
                  transitionAppear
                  transitionAppearTimeout={500}
                  transitionEnterTimeout={500}
                  transitionLeaveTimeout={500}
                  component="div"
                  className="other-publications-entry-content">
                  {collapsePublications.includes(mediaTypeFragment)
                    ? null
                    : this.renderPublicationsMediaQueries(publicationHoldersByMediaType[ mediaTypeUri ].map(publicationHolder => publicationHolder.original))}
                </NonIETransitionGroup>
              </section>
            )
          })
        }
      </NonIETransitionGroup>
    )
  }
}

Publications.propTypes = {
  publications: PropTypes.array.isRequired,
  expandSubResource: PropTypes.func.isRequired,
  locationQuery: PropTypes.object.isRequired,
  startReservation: PropTypes.func.isRequired,
  toggleParameterValue: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  workLanguage: PropTypes.string,
  mediaQueryValues: PropTypes.object,
  libraries: PropTypes.object,
  audiences: PropTypes.array.isRequired,
  searchFilterActions: PropTypes.object.isRequired,
  query: PropTypes.object.isRequired
}

export const messages = defineMessages({
  title: {
    id: 'Publications.title', description: 'Title of the publication', defaultMessage: 'title'
  },
  publicationYear: {
    id: 'Publications.publicationYear',
    description: 'Publication year of the publication',
    defaultMessage: 'publication year'
  },
  language: {
    id: 'Publications.language', description: 'Language of the publication', defaultMessage: 'language'
  },
  format: {
    id: 'Publications.format', description: 'Format of the publication', defaultMessage: 'format'
  },
  copies: {
    id: 'Publications.copies', description: 'Copies of the publication', defaultMessage: 'copies'
  },
  noPublications: {
    id: 'Publications.noPublications',
    description: 'Text displayed when no publications',
    defaultMessage: 'We have no publications'
  },
  numberOfPublications: {
    id: 'Publications.numberOfPublications',
    description: 'The number of publications',
    defaultMessage: 'Publications ({numberOfPublications})'
  },
  noMediaType: {
    id: 'Publications.noMediaType',
    description: 'Label for the category of publications that have no media type',
    defaultMessage: 'Uncategorized'
  },
  showRestOfPublications: {
    id: 'Publications.showRest',
    description: 'Label for showing the publications that where filtered out by the users delimiters',
    defaultMessage: 'Show all of the {mediaType} publications'
  },
  hideRestOfPublications: {
    id: 'Publications.hideRest',
    description: 'Label for hiding the publications that where filtered out by the users delimiters',
    defaultMessage: 'Hide all of the {mediaType} publications'
  }
})

export default injectIntl(Publications)
