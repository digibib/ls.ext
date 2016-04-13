import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'

export default React.createClass({
  propTypes: {
    subjects: PropTypes.array.isRequired
  },
  render () {
    return (
      <h3><FormattedMessage {...messages.subject} /> {this.props.subjects.map(subject => (
          <span data-automation-id='work_subject' key={subject.relativeUri}>
            {subject.name}
          </span>
        )
      )}</h3>
    )
  }
})

const messages = defineMessages({
  subject: {
    id: 'Subjects.subject',
    description: 'The text displayed to identify subjects',
    defaultMessage: 'Subject:'
  }
})
