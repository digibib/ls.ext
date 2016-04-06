import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import Items from './Items'

export default React.createClass({
  propTypes: {
    publication: PropTypes.object.isRequired
  },
  render () {
    console.log(this.props.publication)
    return (
      <div className='col publication-info'>
        <h3><FormattedMessage {...messages.items}/></h3>
        <Items items={this.props.publication.items}/>
      </div>
    )
  }
})

const messages = defineMessages({
  items: {
    id: 'PublicationInfo.items', description: 'Heading for items', defaultMessage: 'Items:'
  }
})