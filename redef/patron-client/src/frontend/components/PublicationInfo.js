import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import Items from './Items'
import { groupByBranch } from '../utils/sorting'

class PublicationInfo extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
    this.handleReservationClick = this.handleReservationClick.bind(this)
  }

  handleClick () {
    this.props.expandSubResource(null, true)
  }

  handleReservationClick (event) {
    event.preventDefault()
    event.stopPropagation()
    this.props.startReservation(this.props.publication.recordId)
  }

  renderButton () {
    const { publication } = this.props
    if (publication.items.length > 0) {
      return (
        <button className="black-btn" type="button" onClick={this.handleReservationClick}
                data-automation-id={`recordId_${publication.recordId}`}>
              <span data-automation-id="publication_order">
                <FormattedMessage {...messages.order} />
              </span>
        </button>
      )
    }
  }

  renderItems (items) {
    if (items) {
      return groupByBranch(items).map(el => {
        return (
          <div key={el.branch} className="items-by-branch">
            <h1>{el.branch}</h1>
            <Items items={el.items} />
            <p style={{clear: 'both'}}></p>
          </div>
          )
      })
    }
  }

  render () {
    const { publication, publication: { items } } = this.props
    return (
      <div>
        <section className="publication-info" data-automation-id={`publication_info_${publication.uri}`}>

          <div className="close-publication-info"
               data-automation-id={`close_publication_info_${publication.uri}`}
               onClick={this.handleClick}>
            <button className="close" type="button">
              <img src="/images/btn-x.svg" alt="Large X" />
            </button>
          </div>

          <div className="title"><h2><FormattedMessage {...messages.about} /></h2></div>
          <div className="entry-content">
            <div className="col">
              <ul>
                <li><strong><FormattedMessage {...messages.isbn} /></strong>
                  &nbsp;<span>{publication.isbn}</span>
                </li>
                <li><strong><FormattedMessage {...messages.numberOfPages} /></strong>
                  &nbsp;<span>{publication.numberOfPages}</span>
                </li>
              </ul>
            </div>

            <div className="col">
              <ul>
                <li><strong><FormattedMessage {...messages.edition} /></strong>
                  &nbsp;<span>{publication.edition}</span>
                </li>
                <li><strong><FormattedMessage {...messages.binding} /></strong>
                  &nbsp;
                  <span>{publication.binding ? this.props.intl.formatMessage({ id: publication.binding }) : ''}</span>
                </li>
              </ul>
            </div>

            <div className="col">
              {this.renderButton()}
            </div>

          </div>

          <div className="title"><h2><FormattedMessage {...messages.items} /></h2></div>
          <div className="entry-content">{this.renderItems(items)}</div>
        </section>
      </div>
    )
  }
}

PublicationInfo.propTypes = {
  publication: PropTypes.object.isRequired,
  expandSubResource: PropTypes.func.isRequired,
  startReservation: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

const messages = defineMessages({
  about: {
    id: 'PublicationInfo.about',
    description: 'Heading for the publication info',
    defaultMessage: 'About this publication'
  },
  items: {
    id: 'PublicationInfo.items', description: 'Heading for items', defaultMessage: 'Items:'
  },
  isbn: {
    id: 'PublicationInfo.isbn', description: 'Header for the ISBN column', defaultMessage: 'ISBN:'
  },
  numberOfPages: {
    id: 'PublicationInfo.numberOfPages',
    description: 'Header for the number of items column',
    defaultMessage: 'Number of pages:'
  },
  edition: {
    id: 'PublicationInfo.edition', description: 'Header for the edition column', defaultMessage: 'Edition:'
  },
  binding: {
    id: 'PublicationInfo.binding', description: 'Header for the binding column', defaultMessage: 'Binding:'
  },
  order: {
    id: 'PublicationInfo.order',
    description: 'The button that allows users to order a publication',
    defaultMessage: 'Order this publication'
  }
})

export default injectIntl(PublicationInfo)
