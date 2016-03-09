import React, { PropTypes } from 'react'
import { Link } from 'react-router'

export default React.createClass({
  propTypes: {
    result: PropTypes.object.isRequired
  },
  renderAuthors (creators) {
    if (creators.length === 0) {
      return
    }
    let authorLabel = 'Forfatter'
    if (creators.length > 1) {
      authorLabel = 'Forfattere'
    }
    return (
      <p data-automation-id='work_creators'>{authorLabel}: {creators.map(creator => {
        return <strong key={creator.relativeUri}><Link to={creator.relativeUri}> {creator.name} </Link></strong>
      })}
      </p>
    )
  },
  render () {
    let result = this.props.result

    let originalTitle = ''
    if (result.originalTitle) {
      originalTitle = (
        <p data-automation-id='work_originaltitle'>
          Originaltittel:
          {result.originalTitle}
        </p>
      )
    }

    let displayTitle = result.mainTitle
    if (result.partTitle) {
      displayTitle += ' — ' + result.partTitle
    }

    let formats = result.publications
      ? [ ...new Set(result.publications.filter(publication => publication.format).map(publication => publication.format)) ]
      : []

    return (
      <div className='result panel'>
        <div className='row'>
          <div className='col book-cover'>
          </div>
          <div className='col result-info'>
            <p>
              <strong><span data-automation-id='work-title'>{displayTitle}</span></strong>
            </p>
            {this.renderAuthors(result.creators)}
            {originalTitle}
          </div>
        </div>
        <div className='row result-more'>
          <div className='col'>
            <strong>Finnes også som:</strong>
          </div>
          <div className='col' data-automation-id='work_formats'>
            Tilgjengelige formater:
            <br/>
            {formats.join(', ')}
          </div>
          <div className='col'>
            <span className='hidden'>Språk:<br/>TODO</span>&nbsp;
          </div>
          <div className='col'>
            <span className='hidden'>TODO Utgivelser</span>
            <Link to={result.relativeUri} className='more'> les mer ►
            </Link>
          </div>
        </div>
      </div>
    )
  }
})
