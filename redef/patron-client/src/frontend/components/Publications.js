import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

import Publication from './Publication'
import PublicationInfo from './PublicationInfo'
import { getId } from '../utils/uriParser'

export default React.createClass({
  propTypes: {
    publications: PropTypes.array.isRequired,
    expandSubResource: PropTypes.func.isRequired,
    locationQuery: PropTypes.object.isRequired,
    startReservation: PropTypes.func.isRequired
  },
  componentWillMount () {
    if (this.props.publications.length === 1) {
      this.props.expandSubResource(this.props.publications[ 0 ].id, true)
    }
  },
  renderEmpty () {
    return (
      <h2 data-automation-id='no_publications'>
        <FormattedMessage {...messages.noPublications} />
      </h2>
    )
  },
  getArrow (column) {
    return [ 0, 1, 2 ].map(number =>
      <div key={`column-${number}`} className='col col-1-3'>
        {number === column ? <div className='triangle-up' /> : ''}&nbsp;</div>
    )
  },
  renderPublications () {
    let publications = [ ...this.props.publications ]
    let threeAndThreePublications = []
    while (publications.length > 0) {
      threeAndThreePublications.push(publications.splice(0, 3))
    }
    let showMore
    return (
      <div>
        {threeAndThreePublications.map((publications, row) => {
          let output = [ <div key={`row-${row}`} className='row'>{publications.map(publication => <Publication
            startReservation={this.props.startReservation}
            key={publication.id}
            expandSubResource={this.props.expandSubResource}
            publication={publication} />)}</div> ]
          let showMorePublication = publications.find(publication => getId(publication.uri) === this.props.locationQuery.showMore)
          if (showMorePublication) {
            showMore = {
              publication: showMorePublication,
              row: row,
              column: publications.indexOf(showMorePublication)
            }
          }
          if (showMore && row === showMore.row) {
            output.push(<div className='row' key={showMore.publication.id}>
                {this.getArrow(showMore.column)}
                <div className='col'>
                  <PublicationInfo expandSubResource={this.props.expandSubResource}
                                   publication={showMore.publication} />
                </div>
              </div>
            )
          }
          return output
        })
        }
      </div>
    )
  },
  render () {
    return (
      <div id='publications' className='panel row'>
        <div className='panel-header'>
          <span><strong><FormattedMessage {...messages.numberOfPublications}
            values={{numberOfPublications: this.props.publications.length}} /></strong></span>
          <div className='panel-arrow panel-open'></div>
        </div>
        <div className='col'>
          {this.props.publications.length > 0 ? this.renderPublications() : this.renderEmpty()}
        </div>
      </div>
    )
  }
})

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
