import React, { PropTypes } from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'

class Subjects extends React.Component {
  renderLabel (subject) {
    let label = subject.prefLabel || subject.name || subject.mainTitle
    if (subject.specification) {
      label += ` (${subject.specification})`
    }
    return label
  }

  searchLink (subject) {
    return `/search?query=subject%3A"${subject}"`
  }

  render () {
    if (this.props.subjects.length > 0) {
      const subjects = this.props.subjects.map(subject => this.renderLabel(subject))
      return (
        <aside className="work-subjects">
          <h2><FormattedMessage {...messages.subjects} /></h2>
          <ul data-automation-id="work_subjects">
            {subjects.map(subject => <li key={subject}><Link to={this.searchLink(subject)}>{subject}</Link></li>)}
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
