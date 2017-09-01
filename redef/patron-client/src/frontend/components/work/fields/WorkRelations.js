import React, {PropTypes} from 'react'
import {Link} from 'react-router'
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl'
import title from '../../../utils/title'
import mainContributorName from '../../../utils/mainContributorName'
import fieldQueryLink from '../../../utils/link'

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
    <aside className="work-relations" >
      <ul >
        {objArray.map(relationType => (
          <li key={relationType} data-automation-id="work_relations" >
            <span className="meta-label" >{intl.formatMessage({ id: relationType })}</span >:&nbsp;
            {workRelations[ relationType ].map(relation => {
              let link = null
              if (relation.type === 'WorkSeries') {
                link = <span >
                  <Link
                    data-automation-id="work_relation_link"
                    to={fieldQueryLink('serie', relation.mainTitle)} >
                    {relation.mainTitle}
                  </Link >
                  {' ('}
                  <FormattedMessage {...messages.workSerie} />
                  {')'}
                  </span >
              } else {
                link = <Link
                  data-automation-id="work_relation_link"
                  to={relation.relativeUri} >
                  {relationLink(title(relation), mainContributorName(relation.contributors), relation.numberInRelation)}
                </Link >
              }
              return (
                <span className="content" key={relation.relativeUri + relationType} >
                <br />
                  {link}
                </span >
              )
            }
            )}
          </li >
        ))}
      </ul >
    </aside >
  )
}

WorkRelations.defaultProps = {
  workRelations: {}
}

WorkRelations.propTypes = {
  workRelations: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  workSerie: {
    id: 'WorkSerie',
    description: 'Label for work series',
    defaultMessage: 'Work series'
  }
})

export default injectIntl(WorkRelations)
