import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import { injectIntl, intlShape } from 'react-intl'
import title from '../../../utils/title'
import mainContributorName from '../../../utils/mainContributorName'

function relationLink (title, mainContributor, number) {
  let link = title
  if (number) {
    link += ` (${number})`
  }
  if (mainContributor !== '') {
    link += ` / ${mainContributor}`
  }
  return link
}

const WorkRelations = ({ workRelations, intl }) => {
  const order = [
    'http://data.deichman.no/relationType#basedOn',
    'http://data.deichman.no/relationType#continuationOf',
    'http://data.deichman.no/relationType#continuedIn',
    'http://data.deichman.no/relationType#partOf'
  ]
  const objArray = []

  Object.keys(workRelations).map((rel) => {
    objArray.push(rel)
    return rel
  })

  objArray.sort((a, b) => {
    return order.indexOf(a) - order.indexOf(b)
  })

  return (
    <aside className="work-relations">
      <ul>
        {objArray.map(relationType => (
          <li key={relationType} data-automation-id="work_relations">
            <span className="meta-label">{intl.formatMessage({ id: relationType })}</span>:&nbsp;
            {workRelations[ relationType ].map(relation =>
              <span className="content" key={relation.relativeUri + relationType}>
                <Link
                  data-automation-id="work_relation_link"
                  to={relation.relativeUri}>
                  {relationLink(title(relation), mainContributorName(relation.contributors), relation.numberInRelation)}
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
