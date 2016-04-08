import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

const Publication = React.createClass({
  propTypes: {
    publication: PropTypes.object.isRequired,
    expandSubResource: PropTypes.func.isRequired,
    intl: intlShape.isRequired
  },
  contextTypes: {
    router: React.PropTypes.object
  },
  renderTitle (publication) {
    let title = publication.mainTitle
    if (publication.partTitle) {
      title += ` — ${publication.partTitle}`
    }
    return title
  },
  handleClick () {
    this.props.expandSubResource(this.props.publication.id, this.context.router)
  },
  render () {
    let publication = this.props.publication
    return (
      <div onClick={this.handleClick} className='col col-1-3 publication-small'
           data-automation-id={`publication_${publication.uri}`}>
          <div className='col book-cover placeholder'/>
          <div className='result-info'>
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
              <span data-automation-id='publication_language'>
                {publication.language ? this.props.intl.formatMessage({ id: publication.language }) : ''}
              </span>
            </p>
            <p>
              <span data-automation-id='publication_format'>
                {publication.format ? this.props.intl.formatMessage({ id: publication.format }) : ''}
              </span>
            </p>
            <p>
              <span data-automation-id='publication_available'>
                <FormattedMessage {...(publication.available ? messages.available : messages.unavailable)} />
              </span>
            </p>
          </div>
      </div>
    )
  }
})

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
  }
})

export default injectIntl(Publication)
