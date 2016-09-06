import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import ClickableElement from '../components/ClickableElement'

class Publication extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
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

  render () {
    const { publication, startReservation } = this.props
    const languages = [ ...new Set(publication.languages.map(language => this.props.intl.formatMessage({ id: language }))) ]
    const formats = [ ...new Set(publication.formats.map(format => this.props.intl.formatMessage({ id: format }))) ]
    const coverAltText = this.props.intl.formatMessage(messages.coverImageOf, { title: this.renderTitle(publication) })

    return (
      <article onClick={this.handleClick} className={this.props.open ? 'single-publication open' : 'single-publication'}
               data-automation-id={`publication_${publication.uri}`}>
        <div className="book-cover">
          {publication.image ? <img src={publication.image} alt={coverAltText} /> : null}
        </div>
        <div className="publication-text-container">
              <span data-automation-id={publication.available ? 'publication_available' : 'publication_unavailable'}>
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
              </span>
          </p>
          <p>
            <span data-automation-id="publication_languages">
              {languages.join(', ')}
            </span>
          </p>
          <p>
            <span data-automation-id="publication_formats">
              {formats.join(', ')}
            </span>
          </p>
          <p>
            <ClickableElement onClickAction={startReservation} onClickArguments={publication.recordId}>
              <button className="black-btn" type="button"
                      data-automation-id={`recordId_${publication.recordId}`}>
                <span data-automation-id="publication_order"><FormattedMessage {...messages.reserve} /></span>
              </button>
            </ClickableElement>
          </p>
        </div>
        <div className="show-status">
          <strong><FormattedMessage {...messages.showStatus} /></strong>
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
  coverImageOf: {
    id: 'Publication.coverImageOf',
    description: 'Used for alt text in images',
    defaultMessage: 'Cover image of: {title}'
  },
  reserve: {
    id: 'Publication.reserve',
    description: 'The button that allows users to reserve a publication',
    defaultMessage: 'Reserve'
  },
  showStatus: {
    id: 'Publication.showStatus',
    description: 'Label used on mobile to indicate that status can be shown',
    defaultMessage: 'Show status'
  }
})

export default injectIntl(Publication)
