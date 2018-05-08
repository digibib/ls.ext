import PropTypes from 'prop-types'
import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as ResourceActions from '../actions/ResourceActions'
import { Link } from 'react-router'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import NonIETransitionGroup from '../components/NonIETransitionGroup'

class Person extends React.Component {
  componentWillMount () {
    this.props.resourceActions.fetchPersonResource(this.props.params.personId)
  }

  renderNoPerson () {
    return (
      <div>
        <FormattedMessage {...messages.noPerson} />
      </div>
    )
  }

  renderEmpty () {
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="wrapper">
        <article className="work-entry loading">
          <i className="icon-spin4 animate-spin" />
        </article>
      </NonIETransitionGroup>
    )
  }

  renderWorks (person) {
    const workTitle = work => {
      let title = work.mainTitle
      if (Object.keys(work.partTitle).length > 0) {
        title += ` —  ${work.partTitle}`
      }
      return title
    }
    return person.works.map(work => {
      return (
        <p className="work" key={work.relativeUri}>
          <Link to={work.relativeUri}>
            <strong>{workTitle(work)}</strong>
          </Link>
        </p>
      )
    })
  }

  renderLifeSpan (person) {
    if (person.birthYear) {
      return (
        <div className="meta-item lifespan">
          <span className="meta-content" data-automation-id="person-lifespan">
            {`(${person.birthYear}-${person.deathYear || ''})`}
          </span>
        </div>
      )
    }
  }

  renderNationality (person) {
    if (person.nationality) {
      return (
        <div className="meta-item">
          <span className="meta-label"><FormattedMessage {...messages.nationality} /></span>
          <span className="meta-content" data-automation-id="person-nationality">
            {this.props.intl.formatMessage({ id: person.nationality })}
          </span>
        </div>
      )
    }
  }

  render () {
    // TODO Better renderEmpty and showing something while it loads the resource.
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    const person = this.props.resources[ this.props.params.personId ]
    if (!person) {
      return this.renderNoPerson()
    }

    return (
      <div className="wrapper">
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="article"
          className="person">
          <header>
            <h1>
              <span data-automation-id="person-title">{person.personTitle}</span>
              <span data-automation-id="person-name">{person.name}</span>
            </h1>
            {this.renderLifeSpan(person)}
            {this.renderNationality(person)}
          </header>
          <section className="person-works">
            <header>
              <h2><FormattedMessage {...messages.work} /></h2>
            </header>
            {this.renderWorks(person)}
          </section>
        </NonIETransitionGroup>
      </div>
    )
  }
}

Person.propTypes = {
  resources: PropTypes.object.isRequired,
  isRequesting: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  resourceActions: PropTypes.object.isRequired,
  params: PropTypes.object.isRequired,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  noPerson: {
    id: 'Person.noPerson',
    description: 'When no person was found',
    defaultMessage: 'No person'
  },
  nationality: {
    id: 'Person.nationality',
    description: 'The text before the nationality of the person',
    defaultMessage: 'First published:'
  },
  work: {
    id: 'Person.work',
    description: 'The header for the list of works',
    defaultMessage: 'Works'
  }
})

function mapStateToProps (state) {
  return {
    resources: state.resources.resources,
    isRequesting: state.resources.isRequesting
  }
}

function mapDispatchToProps (dispatch) {
  return {
    resourceActions: bindActionCreators(ResourceActions, dispatch),
    dispatch: dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Person))
