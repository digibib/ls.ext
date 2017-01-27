import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape } from 'react-intl'

const WorkRelations = ({ workRelations, intl }) => {
  return (
    <aside className="work-relations">
      <ul>
        {Object.keys(workRelations).map(relationType => (
          <li key={relationType} data-automation-id="work_relations">
            <span className="meta-label">{intl.formatMessage({ id: relationType })}</span>:&nbsp;
            {workRelations[ relationType ].map(relation =>
              <span className="content" key={relation.relativeUri + relationType}>
                  <Link
                    data-automation-id="work_relation_link"
                    to={`/search?query=title%3A"${relation.mainTitle}"`}>{relation.mainTitle}
                  </Link>
                </span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  )
}

WorkRelations.defaultProps = {
  workRelations: {}
}

WorkRelations.propTypes = {
  workRelations: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export default injectIntl(WorkRelations)
