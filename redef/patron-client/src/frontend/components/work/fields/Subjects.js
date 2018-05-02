import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'
import fieldQueryLink from '../../../utils/link'

class Subjects extends React.Component {
  render () {
    if (this.props.subjects.length > 0) {
      // filter out empty subjects, only containing id,
      // This happens when work has the subject which is the work itself
      // TODO fix this properly, see DEICH-581
      const subjects = this.props.subjects.filter(subj => Object.keys(subj).length > 1)

      return (
        <aside className="work-subjects">
          <h2><FormattedMessage {...messages.subjects} /></h2>
          <ul data-automation-id="work_subjects">
            {subjects.map(subject => <li key={subject.id}><Link to={fieldQueryLink('emne', subject.linkField)}>{subject.linkLabel}</Link></li>)}
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
