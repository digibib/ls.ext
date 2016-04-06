import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

import Publication from './Publication'
import PublicationInfo from './PublicationInfo'

export default React.createClass({
  propTypes: {
    publications: PropTypes.array.isRequired
  },
  getInitialState () {
    return {
      moreInfo: undefined
    }
  },
  renderEmpty () {
    return (<h2 data-automation-id='no_publications'><FormattedMessage {...messages.noPublications} /></h2>)
  },
  handleClick (publication, row, column) {
    this.setState({
      moreInfo: {
        publication: publication,
        row: row,
        column: column
      }
    })
  },
  getArrow (column) {
    return [ 0, 1, 2 ].map(number =>
      <div className='col col-1-3'>{number === column ? <div className='triangle-up'/> : ''}&nbsp;</div>
    )
  },
  renderPublications () {
    let publicationsCopy = [ ...this.props.publications ]
    let threeAndThreePublications = []
    while (publicationsCopy.length > 0) {
      threeAndThreePublications.push(publicationsCopy.splice(0, 3))
    }
    return (
      <div>
        {threeAndThreePublications.map((publications, row) => {
          let output = [ <div className='row'>{publications.map((publication, column) => <Publication
            key={publication.id}
            onClick={this.handleClick.bind(this, publication, row, column)}
            publication={publication}/>)}</div> ]
          if (this.state.moreInfo && row === this.state.moreInfo.row) {
            output.push(<div className='row'>
              {this.getArrow(this.state.moreInfo.column)}
                <div class='col'>
                  <PublicationInfo publication={this.state.moreInfo.publication}/>
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
            values={{numberOfPublications: this.props.publications.length}}/></strong></span>
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
