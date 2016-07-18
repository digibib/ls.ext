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
    this.props.expandSubResource(this.props.publication.id, true)
  }

  handleReservationClick (event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.startReservation(this.props.publication.recordId)
  }

  renderButton () {
    const { publication, publication: { available } } = this.props
    if (publication.items.length > 0) {
      return (
        <button className={available ? 'black-btn' : 'grey-btn'} type="button" onClick={this.handleReservationClick}
                data-automation-id={`recordId_${publication.recordId}`}>
              <span data-automation-id={available ? 'publication_reserve' : 'publication_order'}>
                  {available
                    ? <FormattedMessage {...messages.reserve} />
                    : <FormattedMessage {...messages.order} />}
              </span>
        </button>
      )
    }
  }

  render () {
    const { publication } = this.props
    const languages = [ ...new Set(publication.languages.map(language => this.props.intl.formatMessage({ id: language }))) ]
    const formats = [ ...new Set(publication.formats.map(format => this.props.intl.formatMessage({ id: format }))) ]
    return (
      <article onClick={this.handleClick} className={this.props.open ? 'single-publication open' : 'single-publication'}
               data-automation-id={`publication_${publication.uri}`} data-formats={formats}>
        <div className="book-cover">
          {publication.image ? <img src={publication.image} /> : null}
        </div>
        <div className="publication-text-container">
              <span data-automation-id="publication_available">
                <p
                  className="free"><FormattedMessage {...(publication.available ? messages.available : messages.unavailable)} /></p>
              </span>
          <h2>
              <span data-automation-id="publication_title">
                {this.renderTitle(publication)}
              </span>
          </h2>
          <p>
              <span data-automation-id="publication_year">
                {publication.publicationYear}
              </span>{publication.publicationYear && languages.length > 0 ? ', ' : null}
              <span data-automation-id="publication_languages">
                {languages.join(', ')}
              </span>
          </p>
          {this.renderButton()}
        </div>
        <div className="show-status">
          <strong>Vis status</strong>
          <button className="show-status-arrow" type="button">
            <img src="/images/btn-red-arrow-open.svg" alt="Red arrow pointing down" />
          </button>
        </div>
      </article>
    )
  }
}

Publication.propTypes = {
  publication: PropTypes.object.isRequired,
  expandSubResource: PropTypes.func.isRequired,
  startReservation: PropTypes.func.isRequired,
  open: PropTypes.bool,
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
  },
  order: {
    id: 'Publication.order',
    description: 'The button that allows users to order a publication when it is not available for immediate reservation',
    defaultMessage: 'Order'
  }
})

export default injectIntl(Publication)
