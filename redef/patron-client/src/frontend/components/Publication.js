import React, { PropTypes } from 'react'

export default React.createClass({
  propTypes: {
    publication: PropTypes.object.isRequired
  },
  renderTitle (publication) {
    let title = publication.mainTitle
    if (publication.partTitle) {
      title += ' - ' + publication.partTitle
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
          {publication.language}
        </td>
        <td data-automation-id='publication_format'>
          {publication.format}
        </td>
        <td>
          {publication.itemsCount}
        </td>
      </tr>
    )
  }
})
