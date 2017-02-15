import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'
import fieldQueryLink from '../../../utils/link'

class Subjects extends React.Component {
  renderLabel (subject) {
    let label = subject.prefLabel || subject.name || subject.mainTitle
    if (subject.specification) {
      label += ` (${subject.specification})`
    }
    if (subject.type === 'Event') {
      if (subject.ordinal) {
        label += ` (${subject.ordinal})`
      }
      if (subject.place) {
        label += `. ${subject.place.prefLabel}`
      }
      if (subject.date) {
        label += `, ${subject.date}`
      }
    }
    return label
  }

  render () {
    if (this.props.subjects.length > 0) {
      const subjects = this.props.subjects
      return (
        <aside className="work-subjects">
          <h2><FormattedMessage {...messages.subjects} /></h2>
          <ul data-automation-id="work_subjects">
            {subjects.map(subject => <li key={subject.id}><Link to={fieldQueryLink('emne', subject.prefLabel || subject.name || subject.mainTitle)}>{this.renderLabel(subject)}</Link></li>)}
          </ul>
        </aside>
      )
    } else {
      return null
    }
  }
}

Subjects.defaultProps = {
  subjects: []
}

Subjects.propTypes = {
  subjects: PropTypes.array.isRequired
}

export const messages = defineMessages({
  subjects: {
    id: 'Subjects.subjects',
    description: 'The text displayed to identify subjects',
    defaultMessage: 'Subjects:'
  }
})

export default Subjects
