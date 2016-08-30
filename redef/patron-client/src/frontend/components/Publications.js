import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import MediaQuery from 'react-responsive'
import firstBy from 'thenby'

import Publication from './Publication'
import PublicationInfo from './PublicationInfo'
import { getId, getFragment } from '../utils/uriParser'
import ClickableElement from './ClickableElement'

class Publications extends React.Component {
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

  renderPublications (publications, publicationsPerRow) {
    const publicationsCopy = [ ...publications ]
    const publicationRows = []
    while (publicationsCopy.length > 0) {
      publicationRows.push(publicationsCopy.splice(0, publicationsPerRow))
    }
    return (
      <section className="work-publications" data-automation-id="work_publications">
        {publicationRows.map((publications, row) => {
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
                                 startReservation={this.props.startReservation} />
              </div>
            )
          }
          return output
        })
        }
      </section>
    )
  }

  renderPublicationsMediaQueries (publications) {
    return (
      <div>
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
      'http://lexvo.org/id/iso639-3/eng': 2,
      'http://lexvo.org/id/iso639-3/dan': 3,
      'http://lexvo.org/id/iso639-3/swe': 4
    }

    const { workLanguage } = this.props
    if (!exceptions[ workLanguage ]) {
      exceptions[ workLanguage ] = 5
    }

    const publicationHoldersByMediaType = {}
    this.props.publications.forEach(publication => {
      if (publication.mediaType.length > 0) {
        publication.mediaType.forEach(mediaTypeUri => {
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
      )
    })

    return publicationHoldersByMediaType
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
      <footer className="other-publications">
        {
          Object.keys(publicationHoldersByMediaType).map(mediaTypeUri => {
            const mediaTypeFragment = getFragment(mediaTypeUri)
            return (
              <div key={mediaTypeUri} data-automation-id="mediaType_group" data-mediatype={mediaTypeUri}>
                <header className="other-publications-title">
                  <h2>{this.props.intl.formatMessage({ id: mediaTypeUri })}</h2>
                </header>

                <div className="entry-content-icon patron-placeholder">
                  <div className="entry-content-icon-single">
                    <img src="/images/icon-audiobook.svg" alt="Black speaker with audio waves" />
                    <p>Lydbok </p>
                  </div>
                </div>

                <ClickableElement onClickAction={this.props.toggleParameterValue}
                                  onClickArguments={[ 'collapsePublications', mediaTypeFragment ]}>
                  <div className="arrow-close">
                    {collapsePublications.includes(mediaTypeFragment)
                      ? <img src="/images/btn-arrow-open.svg" alt="Black arrow pointing down" />
                      : <img src="/images/btn-arrow-close.svg" alt="Black arrow pointing up" />}
                  </div>
                </ClickableElement>
                <div className="other-publications-entry-content">
                  <p>&nbsp;{/* Temporary placeholder to work around CSS placement issue */}</p>
                  {collapsePublications.includes(mediaTypeFragment)
                    ? null
                    : this.renderPublicationsMediaQueries(publicationHoldersByMediaType[ mediaTypeUri ].map(publicationHolder => publicationHolder.original))}
                </div>
              </div>
            )
          })
        }
      </footer>

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
  mediaQueryValues: PropTypes.object
}

const messages = defineMessages({
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
  }
})

export default injectIntl(Publications)
