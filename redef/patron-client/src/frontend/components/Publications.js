import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import MediaQuery from 'react-responsive'

import Publication from './Publication'
import PublicationInfo from './PublicationInfo'
import { getId } from '../utils/uriParser'

class Publications extends React.Component {
  constructor (props) {
    super(props)
    this.handleCollapsePublications = this.handleCollapsePublications.bind(this)
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

  renderPublications (publicationsPerRow) {
    const publications = [ ...this.props.publications ]
    const publicationRows = []
    while (publications.length > 0) {
      publicationRows.push(publications.splice(0, publicationsPerRow))
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
            output.push(<div className="row" key={showMorePublication.id}>
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

  renderPublicationsMediaQueries () {
    return (
      <div>
        <MediaQuery query="(min-width: 992px)" values={{...this.props.mediaQueryValues}}>
          {this.renderPublications(3)}
        </MediaQuery>
        <MediaQuery query="(min-width: 668px) and (max-width: 991px)" values={{...this.props.mediaQueryValues}}>
          {this.renderPublications(2)}
        </MediaQuery>
        <MediaQuery query="(max-width: 667px)" values={{...this.props.mediaQueryValues}}>
          {this.renderPublications(1)}
        </MediaQuery>
      </div>
    )
  }

  handleCollapsePublications () {
    this.props.toggleParameter('collapsePublications')
  }

  render () {
    return (
      <footer className="other-publications">
        <header className="other-publications-title">
          <h2><FormattedMessage {...messages.numberOfPublications}
            values={{numberOfPublications: this.props.publications.length}} /></h2>
        </header>

        <div className="entry-content-icon patron-placeholder">
          <div className="entry-content-icon-single">
            <img src="/images/icon-audiobook.svg" alt="Black speaker with audio waves" />
            <p>Lydbok </p>
          </div>
        </div>

        <div className="arrow-close" onClick={this.handleCollapsePublications}>
          {this.props.locationQuery.collapsePublications === null
            ? <img src="/images/btn-arrow-open.svg" alt="Black arrow pointing down" />
            : <img src="/images/btn-arrow-close.svg" alt="Black arrow pointing up" />}
        </div>

        <div className="other-publications-entry-content">
          {this.props.locationQuery.collapsePublications === null
            ? null
            : (this.props.publications.length > 0 ? this.renderPublicationsMediaQueries() : this.renderEmpty())}
        </div>
      </footer>

    )
  }
}

Publications.propTypes = {
  publications: PropTypes.array.isRequired,
  expandSubResource: PropTypes.func.isRequired,
  locationQuery: PropTypes.object.isRequired,
  startReservation: PropTypes.func.isRequired,
  toggleParameter: PropTypes.func.isRequired,
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
  }
})

export default Publications
