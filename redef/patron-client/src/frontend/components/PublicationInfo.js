import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import Items from './Items'

class PublicationInfo extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    this.props.expandSubResource(null)
  }

  render () {
    return (
      <div>
        <div className='col publication-info' data-automation-id={`publication_info_${this.props.publication.uri}`}>
          <div className='col col-5-6'><h3><FormattedMessage {...messages.items} /></h3></div>
          <div className='col col-1-6 col-right'><h3>
            <span className='close-publication-info'
                  data-automation-id={`close_publication_info_${this.props.publication.uri}`}
                  onClick={this.handleClick}>X</span>
          </h3></div>
          <div className='col'><Items items={this.props.publication.items} /></div>
        </div>
      </div>
    )
  }
}

PublicationInfo.propTypes = {
  publication: PropTypes.object.isRequired,
  expandSubResource: PropTypes.func.isRequired
}

const messages = defineMessages({
  items: {
    id: 'PublicationInfo.items', description: 'Heading for items', defaultMessage: 'Items:'
  }
})

export default PublicationInfo
