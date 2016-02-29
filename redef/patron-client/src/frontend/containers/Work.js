import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as ResourceActions from '../actions/ResourceActions'

import Constants from '../constants/Constants'
import Creators from '../components/Creators'
import Publications from '../components/Publications'
import Items from '../components/Items'

import { inPreferredLanguage } from '../utils/languageHelpers'

const Work = React.createClass({
  propTypes: {
    resourceActions: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired
  },
  componentWillMount () {
    this.props.resourceActions.getWorkResource(`${Constants.backendUri}/work/${this.props.params.id}`)
  },
  renderNoWork () {
    return (
      <div>
        No work
      </div>
    )
  },
  renderEmpty () {
    return <div></div>
  },
  renderCreators (creators) {
    return creators.map(creator => {
      return <u key={creator.relativeUri}>{creator.name}</u>
    })
  },
  renderTitle (work) {
    let title = inPreferredLanguage(work.mainTitle)
    if (work.partTitle && Object.keys(work.partTitle).length > 0) {
      title += ' — ' + inPreferredLanguage(work.partTitle)
    }
    return title
  },
  renderYear (work) {
    if (work.publicationYear) {
      return (
        <p>
          <strong>Første gang utgitt:</strong> <span data-automation-id='work_date'>{work.publicationYear}</span>
        </p>
      )
    }
    return <span data-automation-id='work_date'></span>
  },
  render () {
    // TODO Better renderEmpty and showing something while it loads the resource.
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    let work = this.props.resources[ `${Constants.backendUri}/work/${this.props.params.id}` ]
    if (!work) {
      return this.renderNoWork()
    }

    return (
      <div className='container'>
        <div className='panel row'>
          <div className='panel-header'>
            <span><strong>Verksinformasjon</strong></span>
            <div className='panel-arrow panel-open'></div>
          </div>
          <div id='work' className='col work-info'>
            <h2 data-automation-id='work_title'>{this.renderTitle(work)}</h2>
            <Creators creators={work.creators}/>
            {this.renderYear(work)}
          </div>
        </div>
        <Publications publications={work.publications}/>
        <Items items={work.items}/>
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
)(Work)
