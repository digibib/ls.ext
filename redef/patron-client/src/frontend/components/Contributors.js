import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape } from 'react-intl'

class Contributors extends React.Component {
  render () {
    return (
      <ul className="contributors">
        {Object.keys(this.props.contributors).map(role => (
          <li key={role}>
            <span className="label">{this.props.intl.formatMessage({ id: role })}</span>:&nbsp;
            {this.props.contributors[ role ].map(person =>
              <span className="content">
                <Link
                  data-automation-id="work_contributor_link"
                  key={person.relativeUri + role}
                  to={person.relativeUri}>{person.name}
                </Link>
              </span>
            )}
          </li>
        ))}
      </ul>
    )
  }
}

Contributors.propTypes = {
  contributors: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Contributors)
