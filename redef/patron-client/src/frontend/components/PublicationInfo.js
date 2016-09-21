import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import Items from './Items'
import { groupByBranch } from '../utils/sorting'

class PublicationInfo extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    this.props.expandSubResource(null, true)
  }

  renderItems (items) {
    if (items) {
      return (
        <ReactCSSTransitionGroup
          transitionName="fade-in"
          transitionAppear={true}
          transitionAppearTimeout={10000}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={300}
          component="table"
          className="items-by-branch">
          {this.renderItemsByBranchRow(groupByBranch(items))}
        </ReactCSSTransitionGroup>
      )
    }
  }

  renderItemsByBranchRow(items) {
    console.log(this.flattenItems(items))
  }

  flattenItems(items) {
    return items
  }

  renderMetaItem(label, value) {
    if(value) {
      return (
        <div className="meta-info">
          <div className="meta-label">{label}</div>
          <div className="meta-content">{value}</div>
        </div>
      )
    }
  }

  render () {
    const { publication, publication: { items } } = this.props
    //console.log(publication)
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppear={true}
        transitionAppearTimeout={10000}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}
        component="section"
        className="publication-info"
        data-automation-id={`publication_info_${publication.uri}`}>
        {/* Missing data: Author / bidragsytere */}
        {this.renderMetaItem(this.props.intl.formatMessage(messages.numberOfPages), publication.numberOfPages)}
        {this.renderMetaItem(this.props.intl.formatMessage(messages.edition), publication.edition)}
        {/* Missing data: Publisher */}
        {/* Missing data: Published location */}
        {this.renderMetaItem(this.props.intl.formatMessage(messages.isbn), publication.isbn)}
        {this.renderMetaItem(this.props.intl.formatMessage(messages.biblionr), publication.recordID)}
        {/* Missing data: "forlagsserie" */}
        {/* Missing data: "Deler av utgivelse" */}
        {/* Missing data: "Tilpasning" */}
        {this.renderMetaItem(this.props.intl.formatMessage(messages.binding), publication.binding ? this.props.intl.formatMessage({ id: publication.binding }) : '')}
        <div className="meta-label"><FormattedMessage {...messages.note} /></div>
        <p className="note">Lorem upsim missing data; note {/* Missing data: Note */}</p>
        <h2><FormattedMessage {...messages.items} /></h2>
        <div className="entry-items">{this.renderItems(items)}</div>
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
    id: 'PublicationInfo.items', description: 'Heading for items', defaultMessage: 'Items:'
  },
  isbn: {
    id: 'PublicationInfo.isbn', description: 'Header for the ISBN column', defaultMessage: 'ISBN:'
  },
  biblionr: {
    id: 'PublicationInfo.biblionr', description: 'Header for the BiblioNR/recordID column', defaultMessage: 'RecordID:'
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
  note: {
    id: 'PublicationInfo.note', description: 'Header for the note column', defaultMessage: 'Note:'
  }
})

export default injectIntl(PublicationInfo)
