import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape } from 'react-intl'

class Contributors extends React.Component {
  render () {
    return (
      <div>
        {Object.keys(this.props.contributors).map(role => (
          <p key={role}>
            <strong>{this.props.intl.formatMessage({ id: role })}</strong>:&nbsp;
            {this.props.contributors[ role ].map(person =>
              <Link data-automation-id='work_contributor_link' key={person.relativeUri + role}
                    to={person.relativeUri}>{person.name}</Link>
            )}
          </p>
        ))}
      </div>
    )
  }
}

Contributors.propTypes = {
  contributors: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Contributors)
