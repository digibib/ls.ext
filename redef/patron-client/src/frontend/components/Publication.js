import React, { PropTypes } from 'react'
import { injectIntl, intlShape } from 'react-intl'

const Publication = React.createClass({
  propTypes: {
    publication: PropTypes.object.isRequired,
    intl: intlShape.isRequired
  },
  renderTitle (publication) {
    let title = publication.mainTitle
    if (publication.partTitle) {
      title += ' — ' + publication.partTitle
    }
    return title
  },
  render () {
    let publication = this.props.publication
    return (
      <tr about={publication.id}>
        <td data-automation-id='publication_title'>
          {this.renderTitle(publication)}
        </td>
        <td data-automation-id='publication_year'>
          {publication.publicationYear}
        </td>
        <td data-automation-id='publication_language'>
          {publication.language ? this.props.intl.formatMessage({ id: publication.language }) : ''}
        </td>
        <td data-automation-id='publication_format'>
          {publication.format ? this.props.intl.formatMessage({ id: publication.format }) : ''}
        </td>
        <td>
          {publication.itemsCount}
        </td>
      </tr>
    )
  }
})

export default injectIntl(Publication)
