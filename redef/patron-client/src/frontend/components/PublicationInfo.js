import PropTypes from 'prop-types'
import React from 'react'
import NonIETransitionGroup from './NonIETransitionGroup'
import {injectIntl, intlShape, defineMessages, FormattedMessage} from 'react-intl'
import AgeLimit from './work/fields/publication/AgeLimit'
import BiblioNumber from './work/fields/publication/BiblioNumber'
import Binding from './work/fields/publication/Binding'
import Contributors from './work/fields/Contributors'
import Duration from './work/fields/publication/Duration'
import Ean from './work/fields/publication/Ean'
import Edition from './work/fields/publication/Edition'
import Extent from './work/fields/publication/Extent'
import FormatAdaptations from './work/fields/publication/FormatAdaptations'
import Formats from './work/fields/publication/Formats'
import Isbn from './work/fields/publication/Isbn'
import NumberOfPages from './work/fields/publication/NumberOfPages'
import PlaceOfPublication from './work/fields/publication/PlaceOfPublication'
import Publishers from './work/fields/publication/Publishers'
import PublisherSeries from './work/fields/publication/PublisherSeries'
import SerialIssues from './work/fields/publication/SerialIssues'
import Subtitles from './work/fields/publication/Subtitles'
import Tabs from './Tabs'
import Sorter from './Sorter'

class PublicationInfo extends React.Component {
  renderLocation (location) {
    if (location && location !== '') {
      return <span className="item-location" >{location}</span>
    }
  }

  renderItems (items) {
    if (items) {
      items.sort((a, b) => {
        // Sort items by branch, shelfmark, and "Ikke til hjemlån"-status
        const keya = `${this.props.intl.formatMessage({ id: a.branchcode })}${a.shelfmark}${a.notforloan}`
        const keyb = `${this.props.intl.formatMessage({ id: b.branchcode })}${b.shelfmark}${b.notforloan}`
        if (keya > keyb) {
          return 1
        }
        if (keya < keyb) {
          return -1
        }
        return 0
      })
      return (
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="table"
          className="test" >
          <thead>
          <tr>
            <th><FormattedMessage {...messages.branch} /></th>
            <th><FormattedMessage {...messages.shelfmark} /></th>
            <th><FormattedMessage {...messages.status} /></th>
          </tr>
          </thead>
          <tbody data-automation-id="work_items" >
          {items.map(item => {
            return (
              <tr key={item.barcode} className={(item.available > 0) ? 'available' : 'not-available'} >
                <td data-automation-id="item_location" >{this.props.intl.formatMessage({ id: item.branchcode })}</td>
                <td data-automation-id="item_shelfmark" >{item.shelfmark} {this.renderLocation(item.location)}</td>
                <td data-automation-id="item_status" >{this.renderAvailability(item)}</td>
              </tr>
            )
          })
          }
          {this.renderNoItems(items)}
          </tbody>
        </NonIETransitionGroup>
      )
    }
  }

  static sortOptions (column) {
    const options = {}
    options[ `${column}.asc` ] = 'asc'
    options[ `${column}.desc` ] = 'desc'
    return options
  }

  renderParts (parts) {
    const sortPartsByWithDir = ((this.props.query || {}).sortPartsBy) || 'partNumber.asc' || 'partTitle.asc'
    const sortBy = sortPartsByWithDir.split('.')
    const sortDir = sortBy[ 1 ] === 'asc' ? 1 : -1
    parts.sort((a, b) => {
      const keya = parseInt(a[ sortBy[ 0 ] ]) ||  a[ sortBy[ 0 ] ]
      const keyb = parseInt(b[ sortBy[ 0 ] ]) ||  b[ sortBy[ 0 ] ]
      if (keya > keyb) {
        return sortDir
      }
      if (keya < keyb) {
        return -1 * sortDir
      }
      return 0
    })

    const hasPartNumbers = parts.filter(pubPart => pubPart.partNumber).length > 0
    const hasPageNumbers = parts.filter(pubPart => pubPart.startsAtPage || pubPart.endsAtPage).length > 0

    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="table"
        className="test" >
        <thead>
        <tr>
          {hasPartNumbers &&
            <th>
              <FormattedMessage {...messages.partNumber} />
              <Sorter sortParameter={'sortPartsBy'} sortColumn={'partNumber'}
                      sortOrder={PublicationInfo.sortOptions('partNumber')[ sortPartsByWithDir ]} />
            </th>
          }
          <th>
            <FormattedMessage {...messages.partTitle} />
            <Sorter sortParameter={'sortPartsBy'} sortColumn={'partTitle'}
                    sortOrder={PublicationInfo.sortOptions('partTitle')[ sortPartsByWithDir ]} />
          </th>
          <th>
            <FormattedMessage {...messages.partMainEntry} />
            <Sorter sortParameter={'sortPartsBy'} sortColumn={'mainEntry'}
                    sortOrder={PublicationInfo.sortOptions('mainEntry')[ sortPartsByWithDir ]} />
          </th>

          {hasPageNumbers &&
          <th>
            <FormattedMessage {...messages.pageNumber} />
            <Sorter sortParameter={'sortPartsBy'} sortColumn={'startsAtPage'}
                    sortOrder={PublicationInfo.sortOptions('startsAtPage')[ sortPartsByWithDir ]} />
          </th>
          }
        </tr>
        </thead>
        <tbody data-automation-id="work_parts" >
        {parts.map((part, index) => {
          return (
            <tr key={index} >
              {hasPartNumbers && <td data-automation-id="part_number" >{part.partNumber}</td> }
              <td data-automation-id="part_title" >{part.partTitle}</td>
              <td data-automation-id="part_main_entry" >{part.mainEntry}</td>
              {hasPageNumbers && <td data-automation-id="part_page_number">
                {[ part.startsAtPage, part.endsAtPage ].filter(e => e !== undefined).join('–') }</td>
              }
            </tr>
          )
        })}
        </tbody>
      </NonIETransitionGroup>
    )
  }

  renderAvailability (item) {
    if (item.notforloan) {
      return (
        <span>
          {item.available} <FormattedMessage {...messages.of} /> {item.total} <FormattedMessage {...messages.available} /> - <FormattedMessage {...messages.onlyInhouse} />
        </span>
      )
    } else {
      return (
        <span>
          {item.available} <FormattedMessage {...messages.of} /> {item.total} <FormattedMessage {...messages.available} />
        </span>
      )
    }
  }

  renderNoItems (items) {
    if (items.length === 0) {
      return (
        <tr key="no-items" className="not-available">
          <td data-automation-id="item_location" />
          <td data-automation-id="item_shelfmark" />
          <td data-automation-id="item_status" ><FormattedMessage {...messages.noItems} /></td>
        </tr>
      )
    }
  }

  render () {
    const { publication, publication: { items } } = this.props
    const tabList = [
      { label: this.props.intl.formatMessage(messages.items), tabId: 'items' },
      (publication.publicationParts && publication.publicationParts.length > 0
        ? { label: this.props.intl.formatMessage(messages.parts), tabId: 'parts' }
        : undefined)
    ].filter(e => { return e !== undefined })
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="section"
        className="publication-info"
        data-automation-id={`publication_info_${publication.uri}`} >
        <div className="left" >
          <AgeLimit ageLimit={publication.ageLimit} />
          <Contributors contributors={publication.contributors} />
          <Extent extents={publication.extents} />
          <NumberOfPages numberOfPages={publication.numberOfPages} />
          <Edition edition={publication.edition} />
          <Publishers publishers={publication.publishers} />
          <PlaceOfPublication placeOfPublication={publication.placeOfPublication} />
          <Subtitles subtitles={publication.subtitles} />
          <SerialIssues serialIssues={publication.serialIssues} />
        </div>
        <div className="right" >
          <Formats formats={publication.formats} />
          <Isbn isbn={publication.isbn} />
          <BiblioNumber biblioNumber={publication.recordId} />
          <PublisherSeries publisherSeries={publication.publisherSeries} />
          <FormatAdaptations formatAdaptations={publication.formatAdaptations} />
          <Binding binding={publication.binding} />
          <Duration duration={publication.duration} />
          <Ean ean={publication.ean} />
        </div>
        { publication.notes.length > 0
         ? <div className="wide" >
          <div className="meta-label" ><FormattedMessage {...messages.notes} /></div>

          {publication.notes.map(desc => {
            return (
              <span key={desc} className="note" >{desc}<br /></span>
            )
          })}
        </div>
        : null
        }
        <div className="entry-items" >
          <Tabs label={this.props.intl.formatMessage({ ...messages.publicationInfoMenu })}
                tabList={tabList}
                menuId="showDetails"
                currentTab={(this.props.query || {}).showDetails || 'items'} />
          {
            ((this.props.query || {}).showDetails || 'items') === 'items'
              ? this.renderItems(items)
              : this.renderParts(publication.publicationParts)
          }
        </div>
      </NonIETransitionGroup>
    )
  }
}

PublicationInfo.propTypes = {
  publication: PropTypes.object.isRequired,
  expandSubResource: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
  query: PropTypes.object
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
  publicationInfoMenu: {
    id: 'PublicationInfo.publicationInfoMenu',
    description: 'menu for publication info',
    defaultMessage: 'Parts'
  },
  parts: {
    id: 'PublicationInfo.parts',
    description: 'Heading for parts',
    defaultMessage: 'Parts'
  },

  partNumber: {
    id: 'PublicationInfo.parts.number',
    description: 'Heading for part number',
    defaultMessage: 'Part number'
  },
  partTitle: {
    id: 'PublicationInfo.parts.title',
    description: 'Heading for part title',
    defaultMessage: 'Part title'
  },
  partMainEntry: {
    id: 'PublicationInfo.parts.mainEntry',
    description: 'Heading for part\'s main entry',
    defaultMessage: 'Main entry'
  },
  partExtent: {
    id: 'PublicationInfo.parts.extent',
    description: 'Heading for part\'s extent',
    defaultMessage: 'Extent'
  },
  pageNumber: {
    id: 'PublicationInfo.parts.pageNumber',
    description: 'Heading for part\'s page number or range',
    defaultMessage: 'Page'
  },
  notes: {
    id: 'PublicationInfo.notes',
    description: 'Header for the note column',
    defaultMessage: 'Notes:'
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
  onlyInhouse: {
    id: 'PublicationInfo.onlyInhouse',
    description: 'Label stating that item can only be used in the library',
    defaultMessage: 'Only for use in the library'
  },
  noItems: {
    id: 'PublicationInfo.noItems',
    description: 'Label stating that we have no items of this publication',
    defaultMessage: 'This publication has no items at the moment'
  }
})

export default injectIntl(PublicationInfo)
