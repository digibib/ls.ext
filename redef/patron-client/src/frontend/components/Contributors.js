import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape } from 'react-intl'

const Contributors = React.createClass({
  propTypes: {
    contributors: PropTypes.object.isRequired,
    intl: intlShape.isRequired
  },
  render () {
    return (
      <div>
        {Object.keys(this.props.contributors).map(role => {
          return (
            <p key={role}>
              <strong>{this.props.intl.formatMessage({ id: role })}</strong>:&nbsp;
                {this.props.contributors[role].map(person => {
                  return <Link data-automation-id='work_contributor_link' key={person.relativeUri + role} to={person.relativeUri}>{person.name}</Link>
                })
              }
            </p>
            )
        })}
      </div>
    )
  }
})

export default injectIntl(Contributors)
