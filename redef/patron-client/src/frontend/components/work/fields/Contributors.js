import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape } from 'react-intl'
import fieldQueryLink from '../../../utils/link'

const Contributors = ({ contributors, intl }) => {
  return (
    <ul className="contributors">
      {Object.keys(contributors).map(role => (
        <li key={role}>
          <span className="label">{intl.formatMessage({ id: role })}</span>:&nbsp;
          {contributors[ role ].map(agent =>
            <span className="content" key={agent.relativeUri + role}>
                <Link
                  data-automation-id="work_contributor_link"
                  to={fieldQueryLink('aktør', agent.name)}>{agent.subdivision ? `${agent.name} (${agent.subdivision})` : agent.name}
                </Link>
              </span>
          )}
        </li>
      ))}
    </ul>
  )
}

Contributors.defaultProps = {
  contributors: {}
}

Contributors.propTypes = {
  contributors: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Contributors)
