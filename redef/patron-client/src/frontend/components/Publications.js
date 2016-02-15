import React, { PropTypes } from 'react'

import Publication from './Publication'

export default React.createClass({
  propTypes: {
    publications: PropTypes.array.isRequired
  },
  renderEmpty () {
    return (<h2 data-automation-id='no_publications'>Vi har ingen utgaver</h2>)
  },
  renderPublications () {
    return (
      <table>
        <thead>
        <tr>
          <th>tittel</th>
          <th>utgivelsesår</th>
          <th>språk</th>
          <th>format</th>
          <th>eksemplarer</th>
        </tr>
        </thead>
        <tbody>
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
          <span><strong>Utgivelser ({this.props.publications.length})</strong></span>
          <div className='panel-arrow panel-open'></div>
        </div>
        <div className='col' data-automation-id='publications'>
          {this.props.publications.length > 0 ? this.renderPublications() : this.renderEmpty()}
        </div>
      </div>
    )
  }
})
