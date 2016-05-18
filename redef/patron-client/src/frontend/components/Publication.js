import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

class Publication extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleReservationClick = this.handleReservationClick.bind(this)
  }

  renderTitle (publication) {
    let title = publication.mainTitle
    if (publication.partTitle) {
      title += ` — ${publication.partTitle}`
    }
    return title
  }

  handleClick () {
    this.props.expandSubResource(this.props.publication.id)
  }

  handleReservationClick (event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.startReservation(this.props.publication.recordId)
  }

  render () {
    const publication = this.props.publication
    const languages = [ ...new Set(publication.languages.map(language => this.props.intl.formatMessage({ id: language }))) ]
    const formats = [ ...new Set(publication.formats.map(format => this.props.intl.formatMessage({ id: format }))) ]
    return (
      <div onClick={this.handleClick} className='col col-1-3 publication-small'
           data-automation-id={`publication_${publication.uri}`}>
        <div className='book-cover' />
        <div className='publication-text'>
          <p>
              <span data-automation-id='publication_title'>
                {this.renderTitle(publication)}
              </span>
          </p>
          <p>
              <span data-automation-id='publication_year'>
                {publication.publicationYear}
              </span>
          </p>
          <p>
              <span data-automation-id='publication_languages'>
                {languages.join(', ')}
              </span>
          </p>
          <p>
              <span data-automation-id='publication_formats'>
                {formats.join(', ')}
              </span>
          </p>
          <p>
              <span data-automation-id='publication_available'>
                <FormattedMessage {...(publication.available ? messages.available : messages.unavailable)} />
              </span>
          </p>
          {publication.items.length > 0
            ? (<p>
              <span data-automation-id='publication_reserve'>
                <a onClick={this.handleReservationClick}><FormattedMessage {...messages.reserve} /></a>
              </span>
          </p>) : null}
        </div>
      </div>
    )
  }
}

Publication.propTypes = {
  publication: PropTypes.object.isRequired,
  expandSubResource: PropTypes.func.isRequired,
  startReservation: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

const messages = defineMessages({
  available: {
    id: 'Publication.available',
    description: 'The text displayed when the publication is available',
    defaultMessage: 'Available'
  },
  unavailable: {
    id: 'Publication.unavailable',
    description: 'The text displayed when the publication unavailable',
    defaultMessage: 'Unavailable'
  },
  reserve: {
    id: 'Publication.reserve',
    description: 'The button that allows users to reserve a publication',
    defaultMessage: 'Reserve'
  }
})

export default injectIntl(Publication)
