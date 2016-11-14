import React, { PropTypes } from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import Contributors from './work/fields/Contributors'
import BiblioNumber from './work/fields/publication/BiblioNumber'
import Binding from './work/fields/publication/Binding'
import Duration from './work/fields/publication/Duration'
import Edition from './work/fields/publication/Edition'
import FormatAdaptations from './work/fields/publication/FormatAdaptations'
import Isbn from './work/fields/publication/Isbn'
import NumberOfPages from './work/fields/publication/NumberOfPages'
import PlaceOfPublication from './work/fields/publication/PlaceOfPublication'
import Publishers from './work/fields/publication/Publishers'
import PublisherSeries from './work/fields/publication/PublisherSeries'
import Subtitles from './work/fields/publication/Subtitles'

class PublicationInfo extends React.Component {
  renderLocation (location) {
    if (location !== '') {
      return <span className="item-location">{location}</span>
    }
  }

  renderItems (items) {
    if (items) {
      return (
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="table"
          className="test">
          <thead>
          <tr>
            <th><FormattedMessage {...messages.branch} /></th>
            <th><FormattedMessage {...messages.shelfmark} /></th>
            <th><FormattedMessage {...messages.status} /></th>
          </tr>
          </thead>
          <tbody data-automation-id="work_items">
          {items.map(item => (
            <tr key={item.barcode} className={(item.available > 0) ? 'available' : 'not-available'}>
              <td data-automation-id="item_location">{this.props.intl.formatMessage({ id: item.branchcode })}</td>
              <td data-automation-id="item_shelfmark">{item.shelfmark} {this.renderLocation(item.location)}</td>
              <td data-automation-id="item_status">{this.renderAvailability(item.available, item.total)}</td>
            </tr>
          ))}
          </tbody>
        </NonIETransitionGroup>
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

  render () {
    const { publication, publication: { items } } = this.props
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="publication-info"
        data-automation-id={`publication_info_${publication.uri}`}>
        <div className="left">
          {/* Missing data: Author / bidragsytere */}
          <Contributors contributors={publication.contributors} />
          <NumberOfPages numberOfPages={publication.numberOfPages} />
          <Edition edition={publication.edition} />
          <Publishers publishers={publication.publishers} />
          <PlaceOfPublication placeOfPublication={publication.placeOfPublication} />
          <Subtitles subtitles={publication.subtitles} />
        </div>
        <div className="right">
          <Isbn isbn={publication.isbn} />
          <BiblioNumber biblioNumber={publication.recordId} />
          <PublisherSeries publisherSeries={publication.publisherSeries} />
          {/* Missing data: "Deler av utgivelse" */}
          <FormatAdaptations formatAdaptations={publication.formatAdaptations} />
          <Binding binding={publication.binding} />
          <Duration duration={publication.duration} />
        </div>
        <div className="wide">
          <div className="meta-label"><FormattedMessage {...messages.note} /></div>
          <p className="note">{publication.description}</p>
        </div>
        <div className="entry-items">
          <h2><FormattedMessage {...messages.items} /></h2>
          {this.renderItems(items)}
        </div>
      </NonIETransitionGroup>
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
  }
})

export default injectIntl(PublicationInfo)
