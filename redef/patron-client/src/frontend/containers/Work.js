import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'
import { Link } from 'react-router'

import Contributors from '../components/Contributors'
import Publications from '../components/Publications'
import Genres from '../components/Genres'
import Subjects from '../components/Subjects'
import * as ResourceActions from '../actions/ResourceActions'
import * as ReservationActions from '../actions/ReservationActions'
import * as ParameterActions from '../actions/ParameterActions'
import SearchFilterBox from '../components/SearchFilterBox'
import {toggleFilter} from '../actions/SearchFilterActions'

class Work extends React.Component {
  componentWillMount () {
    this.props.resourceActions.fetchWorkResource(this.props.params.workId)
  }

  renderNoWork () {
    return (
      <div>
        <FormattedMessage {...messages.noWork} />
      </div>
    )
  }

  renderEmpty () {
    return <div />
  }

  renderTitle (work) {
    let title = work.mainTitle
    if (work.partTitle) {
      title += ` — ${work.partTitle}`
    }
    return title
  }

  renderYear (work) {
    if (work.publicationYear) {
      return (
        <p>
          <strong><FormattedMessage {...messages.firstTimePublished} /></strong> <span
          data-automation-id="work_date">{work.publicationYear}</span>
        </p>
      )
    }
    return <span data-automation-id="work_date" />
  }

  render () {
    // TODO Better renderEmpty and showing something while it loads the resource.
    if (this.props.isRequesting) {
      return this.renderEmpty()
    }
    let work = this.props.resources[ this.props.params.workId ]
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

    const { back } = this.props.location.query
    return (
      <div className="container">
        <div className="row">
          {back && back.startsWith('/search') // We don't want to allow arbitrary URLs in the back parameter
            ? (
            <header className="back-to-results">
              <Link to={this.props.location.query.back} alt="Back to search page">Tilbake til søkeresultat</Link>
            </header>
          ) : ''}
          <article className="work-entry">
            <section className="work-information">
              <h1 data-automation-id="work_title">{this.renderTitle(work)}</h1>
              <Contributors contributors={work.contributors} />
              {this.renderYear(work)}
            </section>
            <aside className="work-subjects show-mobile hidden-tablet hidden-desktop">
              <Subjects subjects={work.subjects} />
            </aside>
            <aside className="work-genres show-mobile hidden-tablet hidden-desktop">
              <Genres genres={work.genres} />
            </aside>
            <SearchFilterBox toggleFilter={toggleFilter}/>
            <div className="work-excerpt">
              <p className="patron-placeholder">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget massa
                id mauris maximus porta. In
                dignissim, metus in elementum ultrices, erat velit gravida turpis, id efficitur nunc est vitae purus.
                Aliquam ornare efficitur tellus sit amet dapibus. Aliquam ultrices, sapien in volutpat vehicula, lacus
                nunc pretium leo, quis dignissim arcu nisl vitae velit. Aliquam sit amet nisl non tortor elementum
                consequat. Morbi id nulla ac quam luctus posuere nec a risus. Aenean congue quam tortor, a volutpat
                quam mollis nec. Nullam metus ex, efficitur vitae tortor vitae, imperdiet semper nisl. Mauris vel
                accumsan odio, venenatis fringilla ex.</p>
              <button className="white-btn-checkmark patron-placeholder" type="button">Min huskeliste</button>
            </div>
            <aside className="work-subjects hidden-mobile show-desktop">
              <Subjects subjects={work.subjects} />
            </aside>
            <aside className="work-genres hidden-mobile show-desktop">
              <Genres genres={work.genres} />
            </aside>
          </article>
          <Publications locationQuery={this.props.location.query}
                        expandSubResource={this.props.resourceActions.expandSubResource}
                        publications={work.publications}
                        startReservation={this.props.reservationActions.startReservation}
                        toggleParameterValue={this.props.parameterActions.toggleParameterValue}
                        workLanguage={work.language}
          />
        </div>
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
  parameterActions: PropTypes.object.isRequired
}

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
    isRequesting: state.resources.isRequesting
  }
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch,
    resourceActions: bindActionCreators(ResourceActions, dispatch),
    reservationActions: bindActionCreators(ReservationActions, dispatch),
    parameterActions: bindActionCreators(ParameterActions, dispatch)
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Work)
