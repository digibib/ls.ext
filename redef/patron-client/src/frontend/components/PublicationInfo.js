import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

class PublicationInfo extends React.Component {
  renderItems (items) {
    if (items) {
      return (
        <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="table"
        className="test">
          <tbody>
          <tr>
            <th><FormattedMessage {...messages.branch} /></th>
            <th><FormattedMessage {...messages.shelfmark} /></th>
            <th><FormattedMessage {...messages.status} /></th>
          </tr>
          {items.map(item => {
            return (
              <tr key={item.barcode} className={(item.available > 0) ? 'available' : 'not-available'}>
                <td>{this.props.intl.formatMessage({ id: item.branch })}</td>
                <td>{item.shelfmark}</td>
                <td>{this.renderAvailability(item.available, item.total)}</td>
              </tr>
            )
          })}
          </tbody>
        </ReactCSSTransitionGroup>
      )
    }
  }

  renderAvailability (available, total) {
    return (
      <span>
        {available} <FormattedMessage {...messages.of} /> {total} <FormattedMessage {...messages.available} />
      </span>
    )
  }

  renderMetaItem (label, value) {
    if (value) {
      return (
        <div className="meta-info">
          <div className="meta-label">{label}</div>
          <div className="meta-content">{value}</div>
        </div>
      )
    }
  }

  render () {
    const { publication, publication: { items }, intl } = this.props
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppearTimeout={10000}
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="publication-info"
        data-automation-id={`publication_info_${publication.uri}`}>
        <div className="left">
          {/* Missing data: Author / bidragsytere */}
          {this.renderMetaItem(intl.formatMessage(messages.numberOfPages), publication.numberOfPages)}
          {this.renderMetaItem(intl.formatMessage(messages.edition), publication.edition)}
          {this.renderMetaItem(intl.formatMessage(messages.publisher), publication.publisher)}
          {this.renderMetaItem(intl.formatMessage(messages.placeOfPublication), publication.placeOfPublication)}
        </div>
        <div className="right">
          {this.renderMetaItem(intl.formatMessage(messages.isbn), publication.isbn)}
          {this.renderMetaItem(intl.formatMessage(messages.biblionr), publication.recordID)}
          {/* Missing data: "forlagsserie" */}
          {/* Missing data: "Deler av utgivelse" */}
          {this.renderMetaItem(intl.formatMessage(messages.adaptation), publication.formatAdaptations.map(formatAdaptation => intl.formatMessage({ id: formatAdaptation })).join(', '))}
          {this.renderMetaItem(intl.formatMessage(messages.binding), publication.binding ? intl.formatMessage({ id: publication.binding }) : '')}
        </div>
        <div className="wide">
          <div className="meta-label"><FormattedMessage {...messages.note} /></div>
          <p className="note">{publication.description}</p>
        </div>
        <div className="entry-items">
          <h2><FormattedMessage {...messages.items} /></h2>
          {this.renderItems(items)}
        </div>
      </ReactCSSTransitionGroup>
    )
  }
}

PublicationInfo.propTypes = {
  publication: PropTypes.object.isRequired,
  expandSubResource: PropTypes.func.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  about: {
    id: 'PublicationInfo.about',
    description: 'Heading for the publication info',
    defaultMessage: 'About this publication'
  },
  items: {
    id: 'PublicationInfo.items',
    description: 'Heading for items',
    defaultMessage: 'Items'
  },
  isbn: {
    id: 'PublicationInfo.isbn',
    description: 'Header for the ISBN column',
    defaultMessage: 'ISBN:'
  },
  biblionr: {
    id: 'PublicationInfo.biblionr',
    description: 'Header for the BiblioNR/recordID column',
    defaultMessage: 'RecordID:'
  },
  numberOfPages: {
    id: 'PublicationInfo.numberOfPages',
    description: 'Header for the number of items column',
    defaultMessage: 'Number of pages:'
  },
  edition: {
    id: 'PublicationInfo.edition',
    description: 'Header for the edition column',
    defaultMessage: 'Edition:'
  },
  binding: {
    id: 'PublicationInfo.binding',
    description: 'Header for the binding column',
    defaultMessage: 'Binding:'
  },
  note: {
    id: 'PublicationInfo.note',
    description: 'Header for the note column',
    defaultMessage: 'Note:'
  },
  of: {
    id: 'PublicationInfo.of',
    description: 'Used as component for availability',
    defaultMessage: 'of'
  },
  available: {
    id: 'PublicationInfo.available',
    description: 'Used as component for availability',
    defaultMessage: 'available'
  },
  status: {
    id: 'PublicationInfo.status',
    description: 'Table header for publication items table',
    defaultMessage: 'Status'
  },
  shelfmark: {
    id: 'PublicationInfo.shelfmark',
    description: 'Table header for publication items table',
    defaultMessage: 'Shelfmark'
  },
  branch: {
    id: 'PublicationInfo.branch',
    description: 'Table header for publication items table',
    defaultMessage: 'Branch'
  },
  publisher: {
    id: 'PublicationInfo.publisher',
    description: 'Label for the publisher field',
    defaultMessage: 'Publisher'
  },
  placeOfPublication: {
    id: 'PublicationInfo.placeOfPublication',
    description: 'Label for the place of publication field',
    defaultMessage: 'Place of publication'
  },
  adaptation: {
    id: 'PublicationInfo.adaptation',
    description: 'Label for the adaptation field',
    defaultMessage: 'Adaptation'
  }
})

export default injectIntl(PublicationInfo)
