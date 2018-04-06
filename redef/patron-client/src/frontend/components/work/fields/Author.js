import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

const Author = ({ by }) => (
  <div className="meta-item author">
    {by.length > 0
      ? (
      <span>
            <span className="meta-label"><FormattedMessage {...messages.labelBy} />: </span>
            <span className="meta-content" data-automation-id="work_by">{by.join(' / ')}</span>
          </span>
    ) : null}
  </div>
)

Author.defaultProps = {
  by: []
}

Author.propTypes = {
  by: PropTypes.array.isRequired
}

export const messages = defineMessages({
  labelBy: {
    id: 'Author.labelBy',
    description: 'Label for "by"',
    defaultMessage: 'By'
  }
})

export default Author
