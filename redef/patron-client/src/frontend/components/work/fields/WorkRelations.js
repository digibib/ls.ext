import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape } from 'react-intl'

const Contributors = ({ workRelations, intl }) => {
  return (
    <ul className="workRelations">
      {Object.keys(workRelations).map(relationType => (
        <li key={relationType}>
          <span className="label">{intl.formatMessage({ id: relationType })}</span>:&nbsp;
          {workRelations[ relationType ].map(relation =>
            <span className="content" key={relation.relativeUri + relationType}>
                <Link
                  data-automation-id="work_relation_link"
                  to={`/search?query=agents%3A"${relation.mainTitle}"`}>{relation.mainTitle}
                </Link>
              </span>
          )}
        </li>
      ))}
    </ul>
  )
}

Contributors.defaultProps = {
  workRelations: {}
}

Contributors.propTypes = {
  workRelations: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(Contributors)
