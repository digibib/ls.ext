import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as ResourceActions from '../actions/ResourceActions'
import { Link } from 'react-router'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'

const Person = React.createClass({
  propTypes: {
    resources: PropTypes.object.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    resourceActions: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    intl: intlShape.isRequired
  },
  componentWillMount () {
    this.props.resourceActions.fetchPersonResource(`/person/${this.props.params.personId}`)
  },
  renderNoPerson () {
    return (
      <div>
        <FormattedMessage {...messages.noPerson} />
      </div>
    )
  },
  renderEmpty () {
    return <div></div>
  },
  renderLifeSpan (person) {
    if (person.birthYear) {
      return `(${person.birthYear}-${person.deathYear || ''})`
    }
  },
  renderWorks (person) {
    let workTitle = work => {
      let title = work.mainTitle
      if (Object.keys(work.partTitle).length > 0) {
        title += ` —  ${work.partTitle}`
      }
      return title
    }
    return person.works.map(work => {
      return (
        <p className='work' key={work.relativeUri}>
          <Link to={work.relativeUri}>
            <strong>{workTitle(work)}</strong>
          </Link>
        </p>
      )
    })
  },
  renderNationality (person) {
    if (person.nationality) {
      return (
        <p>
          <strong><FormattedMessage {...messages.nationality} /></strong>&nbsp;<span
          data-automation-id='person-nationality'>{this.props.intl.formatMessage({ id: person.nationality })}</span>
        </p>
      )
    }
  },
  render () {
    // TODO Better renderEmpty and showing something while it loads the resource.
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    let person = this.props.resources[ `/person/${this.props.params.personId}` ]
    if (!person) {
      return this.renderNoPerson()
    }

    return (
      <div className='container'>
        <div className='panel row person-info'>
          <div className='col person-image hidden'>
            TODO
          </div>
          <div className='col'>
            <h2><span data-automation-id='person-title'>{person.personTitle}</span>&nbsp;<span
              data-automation-id='person-name'>{person.name}</span></h2>
            <h3><span data-automation-id='lifespan'>{this.renderLifeSpan(person)}</span></h3>
            <div className='small-text'>
              {this.renderNationality(person)}
            </div>
          </div>
        </div>
        <div className='panel column full'>
          <div className='col'>
            <h3><FormattedMessage {...messages.work} /></h3>
            {this.renderWorks(person)}
          </div>
        </div>
      </div>
    )
  }
})

const messages = defineMessages({
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
