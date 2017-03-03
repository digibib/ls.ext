import React, { PropTypes } from 'react'
import NonIETransitionGroup from '../components/NonIETransitionGroup'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'
import MediaQuery from 'react-responsive'

import WorkInformation from '../components/work/WorkInformation'
import Publications from '../components/Publications'
import * as ResourceActions from '../actions/ResourceActions'
import * as ReservationActions from '../actions/ReservationActions'
import * as ParameterActions from '../actions/ParameterActions'
import * as SearchFilterActions from '../actions/SearchFilterActions'
import AdditionalInformationContent from '../components/work/AdditionalInformationContent'

class Work extends React.Component {
  componentWillMount () {
    this.props.resourceActions.fetchWorkResource(this.props.params.workId)
  }

  // Force reload when router changes workId in URI
  componentWillReceiveProps (nextProps) {
    // Check for change in URI, to avoid infinite loops on fetch errors
    if (this.props.params.workId !== nextProps.routeParams.workId) {
      this.props.resourceActions.fetchWorkResource(nextProps.routeParams.workId)
    }
  }

  renderNoWork () {
    return (
      <NonIETransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionAppearTimeout={500}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="wrapper">
        <FormattedMessage {...messages.noWork} />
      </NonIETransitionGroup>
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

  renderOriginalReleaseDate (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelOriginalReleaseDate} />: </span>
        <span className="meta-content">Placholder original release date</span>
      </div>
    )
  }

  renderPartOfSeries (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelSeries} />: </span>
        <span
          className="meta-content">{work.serials.join(', ')}</span>
      </div>
    )
  }

  renderRelations (work) {
    return (
      <div>
        {/*
         foreach relation
         */}
        {this.renderRelation(work)}
      </div>
    )
  }

  renderRelation (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelRelation} />: </span>
        <span className="meta-content">Placeholder relation</span>
      </div>
    )
  }

  renderAvailableMediaTypes (publications) {
    const mediaTypes = []
    publications.forEach(publication => {
      publication.mediaTypes.forEach(mediaType => {
        if (mediaTypes.indexOf(mediaType.split('.no/').pop()) < 0) mediaTypes.push(mediaType.split('.no/').pop())
      })
    })
    return (
      <ul>
        <li>Here they come</li>
        {mediaTypes.map(mediaType => <li><Link to={mediaType}>{mediaType}</Link></li>)}
      </ul>
    )
  }

  render () {
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    const work = this.props.resources[ this.props.params.workId ]
    if (!work) {
      return this.renderNoWork()
    }

    const publicationsWithItems = work.publications.map(publication => {
      const newPublication = { ...publication, items: this.props.items[ publication.recordId ] ? this.props.items[ publication.recordId ].items : [] }
      newPublication.available = newPublication.items.filter(item => item.available).length > 0
      newPublication.numHolds = this.props.items[ publication.recordId ] ? this.props.items[ publication.recordId ].numHolds : 0
      return newPublication
    })

    const { back } = this.props.location.query

    return (
      <main role="main" className="wrapper">
        <NonIETransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={500}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="article"
          className="work-entry">
          {back && back.startsWith('/search') // We don't want to allow arbitrary URLs in the back parameter
            ? (
            <header className="back-to-results">
              <Link to={this.props.location.query.back}>
                <i className="icon-angle-double-left" aria-hidden="true" />Tilbake til søkeresultat
              </Link>
            </header>
          ) : ''}

          <WorkInformation work={work} publicationId={this.props.params.publicationId}
                           showAdditionalInformation={this.props.showAdditionalInformation.includes(work.id)}
                           toggleShowAdditionalInformation={this.props.resourceActions.toggleShowAdditionalInformation} />

          <MediaQuery query="(min-width: 992px)" values={{ ...this.props.mediaQueryValues }}>
            <AdditionalInformationContent work={work} />
          </MediaQuery>
          {/* this.renderAvailableMediaTypes(work.publications) */}

          <Publications locationQuery={this.props.location.query}
                        expandSubResource={this.props.resourceActions.expandSubResource}
                        publications={publicationsWithItems}
                        startReservation={this.props.reservationActions.startReservation}
                        toggleParameterValue={this.props.parameterActions.toggleParameterValue}
                        workLanguage={work.language}
                        libraries={this.props.libraries}
                        audiences={Array.isArray(this.props.resources[ this.props.params.workId ].audience) ? this.props.resources[ this.props.params.workId ].audience : [ this.props.resources[ this.props.params.workId ].audience ]}
                        searchFilterActions={this.props.searchFilterActions}
                        query={this.props.query} />

        </NonIETransitionGroup>

      </main>
    )
  }
}

Work.propTypes = {
  resourceActions: PropTypes.object.isRequired,
  resources: PropTypes.object.isRequired,
  isRequesting: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  reservationActions: PropTypes.object.isRequired,
  parameterActions: PropTypes.object.isRequired,
  query: PropTypes.object.isRequired,
  searchFilterActions: PropTypes.object.isRequired,
  libraries: PropTypes.object.isRequired,
  items: PropTypes.object.isRequired,
  intl: intlShape.isRequired,
  audiences: PropTypes.array,
  mediaQueryValues: PropTypes.object,
  showAdditionalInformation: PropTypes.array.isRequired
}

export const messages = defineMessages({

  noWork: {
    id: 'Work.noWork',
    description: 'When no work was found',
    defaultMessage: 'No work'
  },

  labelRelation: {
    id: 'Work.labelRelation',
    description: 'Label for relation',
    defaultMessage: 'Name of relation'
  },
  labelSeries: {
    id: 'Work.labelSeries',
    description: 'Label for series',
    defaultMessage: 'Part of series'
  },

  labelOriginalReleaseDate: {
    id: 'Work.labelOriginalReleaseDate',
    description: 'Label for original release date',
    defaultMessage: 'Original release date'
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
    isRequesting: state.resources.isRequesting,
    query: state.routing.locationBeforeTransitions.query,
    libraries: state.application.libraries,
    items: state.resources.items,
    showAdditionalInformation: state.resources.showAdditionalInformation
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    resourceActions: bindActionCreators(ResourceActions, dispatch),
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    parameterActions: bindActionCreators(ParameterActions, dispatch),
    searchFilterActions: bindActionCreators(SearchFilterActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(Work))
