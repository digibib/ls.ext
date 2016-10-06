import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'

import Contributors from '../components/Contributors'
import Publications from '../components/Publications'
import Genres from '../components/Genres'
import Subjects from '../components/Subjects'
import * as ResourceActions from '../actions/ResourceActions'
import * as ReservationActions from '../actions/ReservationActions'
import * as ParameterActions from '../actions/ParameterActions'
import * as SearchFilterActions from '../actions/SearchFilterActions'
import MediaQuery from 'react-responsive'

class Work extends React.Component {

  constructor (props) {
    super(props)
    this.toggleAditionalInfo = this.toggleAditionalInfo.bind(this)
    this.state = {
      showAdditionalInfo: false
    }
  }

  componentWillMount () {
    this.props.resourceActions.fetchWorkResource(this.props.params.workId)
  }

  toggleAditionalInfo (event) {
    event.preventDefault()
    event.stopPropagation()
    if (this.state.showAdditionalInfo) {
      this.setState({ showAdditionalInfo: false })
    } else {
      this.setState({ showAdditionalInfo: true })
    }
  }

  renderNoWork () {
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppearTimeout={10000}
        transitionAppear
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="wrapper">
        <FormattedMessage {...messages.noWork} />
      </ReactCSSTransitionGroup>
    )
  }

  renderEmpty () {
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppearTimeout={10000}
        transitionAppear
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="wrapper">
        <article className="work-entry loading">
          <i className="icon-spin4 animate-spin" />
        </article>
      </ReactCSSTransitionGroup>
    )
  }

  renderYear (work) {
    if (work.publicationYear) {
      return (
        <div className="meta-item">
          <span className="meta-label"><FormattedMessage {...messages.labelOriginalReleaseDate} />: </span>
          <span className="meta-content" data-automation-id="work_date">{work.publicationYear}</span>
        </div>
      )
    }
    return <span data-automation-id="work_date" />
  }

  renderOriginalTitle (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelOriginalTitle} />: </span>
        <span className="meta-content">{work.mainTitle}</span>
      </div>
    )
  }

  renderOriginalLanguage (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelOriginalLanguage} />: </span>
        <span
          className="meta-content">{work.languages.map(language => this.props.intl.formatMessage({ id: language }))}</span>
      </div>
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

  renderAuthor (work) {
    return (
      <div className="meta-item author">
        <span className="meta-label"><FormattedMessage {...messages.labelBy} />: </span>
        <span className="meta-content">{work.by}</span>
      </div>
    )
  }

  renderExcerpt (work) {
    return (
      <p className="work-excerpt">{work.hasSummary}</p>
    )
  }

  renderTargetAudience (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelTargetAudience} />: </span>
        <span
          className="meta-content">{work.audience ? this.props.intl.formatMessage({ id: work.audience }) : null}</span>
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
        <span className="meta-content">Placholder relation</span>
      </div>
    )
  }

  renderDeweynr (work) {
    return (
      <div className="meta-item">
        <span className="meta-label"><FormattedMessage {...messages.labelDeweynr} />: </span>
        <span className="meta-content">{work.deweyNumber}</span>
      </div>
    )
  }

  renderAdditionalInfo (work) {
    if (this.state.showAdditionalInfo) {
      return (
        <div className="additional-info">
          <Link to="#" className="additional-info-toggle" onClick={this.toggleAditionalInfo}>
            <FormattedMessage {...messages.additionalInfoToggleLess} /><i className="icon-up-open" />
          </Link>
          {this.renderAdditionalInfoContent(work)}
        </div>
      )
    } else {
      return (
        <div className="additional-info">
          <Link to="#" className="additional-info-toggle" onClick={this.toggleAditionalInfo}>
            <FormattedMessage {...messages.additionalInfoToggleMore} /><i className="icon-down-open" />
          </Link>
        </div>
      )
    }
  }

  renderAdditionalInfoContent (work) {
    return (
      <ReactCSSTransitionGroup
        transitionName="fade-in"
        transitionAppear
        transitionLeave
        transitionAppearTimeout={10000}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={500}
        component="div"
        className="additional-info">
        {this.renderTargetAudience(work)}
        {this.renderPartOfSeries(work)}
        {/* this.renderRelations(work) */}
        {this.renderDeweynr(work)}
        <Subjects subjects={work.subjects} />
        <Genres genres={work.genres} />
      </ReactCSSTransitionGroup>
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

  getFieldsFromChosenPublication (work) {
    let mainTitle = work.mainTitle
    let partTitle = work.partTitle
    let partNumber = work.partNumber
    if (this.props.params.publicationId) {
      const chosenPublication = work.publications.find(publication => publication.id === this.props.params.publicationId)
      if (chosenPublication) {
        mainTitle = chosenPublication.mainTitle
        partTitle = chosenPublication.partTitle
        partNumber = chosenPublication.partNumber
      }
    }
    return { mainTitle, partTitle, partNumber }
  }

  render () {
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    let work = this.props.resources[ this.props.params.workId ]
    if (!work) {
      return this.renderNoWork()
    } else {
      work = { ...work }
    }

    const publicationsWithItems = work.publications.map(publication => {
      const newPublication = { ...publication, items: this.props.items[ publication.recordId ] || [] }
      newPublication.available = newPublication.items.filter(item => item.status === 'Ledig').length > 0
      return newPublication
    })

    const { mainTitle, partTitle, partNumber } = this.getFieldsFromChosenPublication(work)
    const { back } = this.props.location.query

    return (
      <div className="wrapper">
        <ReactCSSTransitionGroup
          transitionName="fade-in"
          transitionAppear
          transitionAppearTimeout={10000}
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
          component="article"
          className="work-entry">
          {back && back.startsWith('/search') // We don't want to allow arbitrary URLs in the back parameter
            ? (
            <header className="back-to-results">
              <Link to={this.props.location.query.back} alt="Back to search page">
                <i className="icon-angle-double-left" />Tilbake til søkeresultat
              </Link>
            </header>
          ) : ''}

          <section className="work-information">
            <h1 data-automation-id="work_title">{mainTitle}</h1>
            <h2>{partTitle ? `${partTitle} ${partNumber}` : partNumber}</h2>
            {this.renderAuthor(work)}
            {this.renderOriginalTitle(work)}
            {this.renderOriginalLanguage(work)}
            {this.renderYear(work)}
            {/* this.renderOriginalReleaseDate(work) */}
            <Contributors contributors={work.contributors} />
            {this.renderExcerpt(work)}
            <MediaQuery query="(max-width: 991px)" values={{ ...this.props.mediaQueryValues }}>
              {this.renderAdditionalInfo(work)}
            </MediaQuery>
          </section>

          <MediaQuery query="(min-width: 992px)" values={{ ...this.props.mediaQueryValues }}>
            {this.renderAdditionalInfoContent(work)}
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

        </ReactCSSTransitionGroup>

      </div>
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
  mediaQueryValues: PropTypes.object
}

export const messages = defineMessages({
  additionalInfoToggleLess: {
    id: 'Work.additionalInfoToggleLess',
    description: 'Text used in trigger for displaying additional info',
    defaultMessage: 'Less about this work'
  },
  additionalInfoToggleMore: {
    id: 'Work.additionalInfoToggleMore',
    description: 'Text used in trigger for displaying additional info',
    defaultMessage: 'More about this work'
  },
  noWork: {
    id: 'Work.noWork',
    description: 'When no work was found',
    defaultMessage: 'No work'
  },
  labelDeweynr: {
    id: 'Work.labelDeweynr',
    description: 'Label for deweynr meta',
    defaultMessage: 'Deweynr.'
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
  labelTargetAudience: {
    id: 'Work.labelTargetAudience',
    description: 'Label for target audience',
    defaultMessage: 'Target audience'
  },
  labelBy: {
    id: 'Work.labelBy',
    description: 'Label for "by"',
    defaultMessage: 'By'
  },
  labelOriginalReleaseDate: {
    id: 'Work.labelOriginalReleaseDate',
    description: 'Label for original release date',
    defaultMessage: 'Original release date'
  },
  labelOriginalLanguage: {
    id: 'Work.labelOriginalLanguage',
    description: 'Label for original language',
    defaultMessage: 'Original language'
  },
  labelOriginalTitle: {
    id: 'Work.labelOriginalTitle',
    description: 'Label for original title',
    defaultMessage: 'Original title'
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
    items: state.resources.items
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
