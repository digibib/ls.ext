import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as ResourceActions from '../actions/ResourceActions'
import { Link } from 'react-router'
import { inPreferredLanguage } from '../utils/languageHelpers'

import Constants from '../constants/Constants'

const Person = React.createClass({
  propTypes: {
    resources: PropTypes.object.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    resourceActions: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired
  },
  componentWillMount () {
    this.props.resourceActions.getPersonResource(Constants.backendUri + '/person/' + this.props.params.id)
  },
  renderNoPerson () {
    return (
      <div>
        No person
      </div>
    )
  },
  renderEmpty () {
    return <div></div>
  },
  renderLifeSpan (person) {
    let lifeSpan = ''
    if (person.birthYear) {
      lifeSpan = '(' + person.birthYear + '-'
      if (person.deathYear) {
        lifeSpan += person.deathYear
      }
      lifeSpan += ')'
    }
    return lifeSpan
  },
  hiddenIfFalse (val) {
    if (!val) {
      return 'hidden'
    }
    return ''
  },
  renderWorks (person) {
    let workTitle = function (work) {
      let title = inPreferredLanguage(work.mainTitle)
      if (Object.keys(work.partTitle).length > 0) {
        title += ' — ' + inPreferredLanguage(work.partTitle)
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
  render () {
    // TODO Better renderEmpty and showing something while it loads the resource.
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    let person = this.props.resources[ Constants.backendUri + '/person/' + this.props.params.id ]
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
              <p className={this.hiddenIfFalse(person.nationality)}>
                <strong>nasjonalitet:</strong>&nbsp;<span
                data-automation-id='person-nationality'>{person.nationality}</span>
              </p>
            </div>
          </div>
        </div>
        <div className='panel column full'>
          <div className='col'>
            <h3>Verk</h3>
            {this.renderWorks(person)}
          </div>
        </div>
      </div>
    )
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
)(Person)
