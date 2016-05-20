import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import Items from './Items'

class PublicationInfo extends React.Component {
  constructor (props) {
    super(props)
    this.handleClick = this.handleClick.bind(this)
  }

  handleClick () {
    this.props.expandSubResource(null, true)
  }

  render () {
    return (
      <div>
        <section className='publication-info' data-automation-id={`publication_info_${this.props.publication.uri}`}>

          <div className='close-publication-info'
               data-automation-id={`close_publication_info_${this.props.publication.uri}`}
               onClick={this.handleClick}>
            <button className='close' type='button'>
              <img src='/images/btn-x.svg' alt='Large X' />
            </button>
          </div>

          <div className='title'><h2>Om denne utgivelsen</h2></div>
          <div className='entry-content'>
            <div className='col'>
              <ul>
                <li><strong>Sidetall:</strong> 322</li>
                <li><strong>Format:</strong> Bok</li>
                <li><strong>ISBN:</strong> Norsk</li>
                <li><strong>Språk:</strong> Norsk</li>
              </ul>
            </div>

            <div className='col'>
              <ul>
                <li><strong>Undertittel:</strong> Snømannen</li>
                <li><strong>Format:</strong> Bok</li>
                <li><strong>ISBN:</strong> Norsk</li>
                <li><strong>Språk:</strong> Norsk</li>
              </ul>
            </div>

          </div>

          <div className='title'><h2><FormattedMessage {...messages.items} /></h2></div>
          <div className='entry-content'><Items items={this.props.publication.items} /></div>
        </section>
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
