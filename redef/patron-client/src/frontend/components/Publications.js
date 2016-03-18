import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

import Publication from './Publication'

export default React.createClass({
  propTypes: {
    publications: PropTypes.array.isRequired
  },
  renderEmpty () {
    return (<h2 data-automation-id='no_publications'><FormattedMessage {...messages.noPublications} /></h2>)
  },
  renderPublications () {
    return (
      <table>
        <thead>
        <tr>
          <th><FormattedMessage {...messages.title} /></th>
          <th><FormattedMessage {...messages.publicationYear} /></th>
          <th><FormattedMessage {...messages.language} /></th>
          <th><FormattedMessage {...messages.format} /></th>
          <th><FormattedMessage {...messages.copies} /></th>
        </tr>
        </thead>
        <tbody data-automation-id='publications'>
        {this.props.publications.map(publication => {
          return <Publication key={publication.id} publication={publication}/>
        })}
        </tbody>
      </table>
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
