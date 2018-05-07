import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages } from 'react-intl'
import MetaItem from '../../../MetaItem'

import { Link } from 'react-router'
import fieldQueryLink from '../../../../utils/link'

const Publishers = ({ publishers }) => {
  if (publishers.length > 0) {
    return (
      <MetaItem label={messages.publishers} data-automation-id="publication_publishers">
        {publishers.map((publisher, index) => {
          const publisherName = publisher.subdivision ? `${publisher.name} (${publisher.subdivision})` : publisher.name

          return (
            <span key={publisher.id}>
              <Link to={fieldQueryLink('utgiver', publisherName)}>
                {publisherName}
              </Link>
              { index + 1 === publishers.length ? '' : ', '}
            </span>
          )
        })}

      </MetaItem>
    )
  } else {
    return null
  }
}

Publishers.defaultProps = {
  publishers: []
}

Publishers.propTypes = {
  publishers: PropTypes.array.isRequired
}

export const messages = defineMessages({
  publishers: {
    id: 'Publishers.publishers',
    description: 'Label for publishers meta',
    defaultMessage: 'Publishers'
  }
})

export default Publishers
