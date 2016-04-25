import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

import Constants from '../constants/Constants'
import Contributors from '../components/Contributors'
import Publications from '../components/Publications'
import Genres from '../components/Genres'
import Subjects from '../components/Subjects'
import * as ResourceActions from '../actions/ResourceActions'
import * as ReservationActions from '../actions/ReservationActions'

const Work = React.createClass({
  propTypes: {
    resourceActions: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    isRequesting: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    params: PropTypes.object.isRequired,
    locationQuery: PropTypes.object.isRequired,
    reservationActions: PropTypes.object.isRequired

  },
  componentWillMount () {
    this.props.resourceActions.getWorkResource(`${Constants.backendUri}/work/${this.props.params.workId}`)
  },
  renderNoWork () {
    return (
      <div>
        <FormattedMessage {...messages.noWork} />
      </div>
    )
  },
  renderEmpty () {
    return <div />
  },
  renderTitle (work) {
    let title = work.mainTitle
    if (work.partTitle) {
      title += ` — ${work.partTitle}`
    }
    return title
  },
  renderYear (work) {
    if (work.publicationYear) {
      return (
        <p>
          <strong><FormattedMessage {...messages.firstTimePublished} /></strong> <span
          data-automation-id='work_date'>{work.publicationYear}</span>
        </p>
      )
    }
    return <span data-automation-id='work_date' />
  },
  render () {
    // TODO Better renderEmpty and showing something while it loads the resource.
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    let work = this.props.resources[ `${Constants.backendUri}/work/${this.props.params.workId}` ]
    if (!work) {
      return this.renderNoWork()
    } else {
      work = { ...work }
    }

    if (this.props.params.publicationId) {
      const chosenPublication = work.publications.find(publication => publication.id === this.props.params.publicationId)
      if (chosenPublication) {
        work.mainTitle = chosenPublication.mainTitle
        work.partTitle = chosenPublication.partTitle
      }
    }

    return (
      <div className='container'>
        <div className='panel row'>
          <div className='panel-header'>
            <span><strong><FormattedMessage {...messages.workInformation} /></strong></span>
            <div className='panel-arrow panel-open'></div>
          </div>
          <div id='work' className='col work-info'>
            <h2 data-automation-id='work_title'>{this.renderTitle(work)}</h2>
            <Contributors contributors={work.contributors} />
            {this.renderYear(work)}
            <Subjects subjects={work.subjects} />
            <Genres genres={work.genres} />
          </div>
        </div>
        <Publications locationQuery={this.props.locationQuery}
                      expandSubResource={this.props.resourceActions.expandSubResource}
                      publications={work.publications}
                      startReservation={this.props.reservationActions.startReservation} />
      </div>
    )
  }
})

const messages = defineMessages({
  noWork: {
    id: 'Work.noWork',
    description: 'When no work was found',
    defaultMessage: 'No work'
  },
  firstTimePublished: {
    id: 'Work.firstTimePublished',
    description: 'The year the work was first published',
    defaultMessage: 'First published:'
  },
  workInformation: {
    id: 'Work.workInformation',
    description: 'The header text for the work information',
    defaultMessage: 'Work information'
  }
})

function mapStateToProps (state) {
  return {
    resources: state.resources.resources,
    locationQuery: state.routing.locationBeforeTransitions.query,
    isRequesting: state.resources.isRequesting
  }
}

function mapDispatchToProps (dispatch) {
  return {
    resourceActions: bindActionCreators(ResourceActions, dispatch),
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    dispatch: dispatch
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Work)
