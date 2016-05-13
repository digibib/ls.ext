import React, { PropTypes } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { defineMessages, FormattedMessage } from 'react-intl'

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
    this.props.resourceActions.fetchWorkResource(`/work/${this.props.params.workId}`)
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
    let work = this.props.resources[ `/work/${this.props.params.workId}` ]
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
        <div className='row'>

          <header className='back-to-results'>
            <a href='#' alt='Back to search page'>Tilbake til søkeresultat</a>
          </header>

          <article className='work-entry'>
            <div className='book-cover'>
            </div>

            <section className='work-information'>

              <h1 data-automation-id='work_title'>{this.renderTitle(work)}</h1>
              <Contributors contributors={work.contributors} />
              {this.renderYear(work)}
              <Subjects subjects={work.subjects} />
              <Genres genres={work.genres} />

              <div>
              {/*
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis eget massa id mauris maximus porta. In
                  dignissim, metus in elementum ultrices, erat velit gravida turpis, id efficitur nunc est vitae purus.
                  Aliquam ornare efficitur tellus sit amet dapibus. Aliquam ultrices, sapien in volutpat vehicula, lacus
                  nunc pretium leo, quis dignissim arcu nisl vitae velit. Aliquam sit amet nisl non tortor elementum
                  consequat. Morbi id nulla ac quam luctus posuere nec a risus. Aenean congue quam tortor, a volutpat
                  quam mollis nec. Nullam metus ex, efficitur vitae tortor vitae, imperdiet semper nisl. Mauris vel
                  accumsan odio, venenatis fringilla ex.</p>
                */}
              </div>

              <button className='black-btn' type='button'>Bestill første ledige</button>
              <button className='white-btn-checkmark' type='button'>Min huskeliste</button>

            </section>
{/*

            <aside className='work-subjects'>
              <h2>Emner:</h2>

              <ul>
                <li><a href='#' alt='Emne #1'>Emne #1</a></li>
                <li><a href='#' alt='Emne #2'>Emne #2</a></li>
                <li><a href='#' alt='Emne #3'>Emne #3</a></li>
              </ul>

              <a href='#' alt='More subjects'>Se flere emner</a>
            </aside>

            <aside className='work-genres'>
              <h2>Sjanger:</h2>

              <ul>
                <li><a href='#' alt='Genre #1'>Genre #1</a></li>
                <li><a href='#' alt='Genre #2'>Genre #2</a></li>
                <li><a href='#' alt='Genre #3'>Genre #3</a></li>
              </ul>

              <a href='#' alt='More genres'>Se flere sjangre</a>
            </aside>
*/}
          </article>
          <Publications locationQuery={this.props.locationQuery}
                        expandSubResource={this.props.resourceActions.expandSubResource}
                        publications={work.publications}
                        startReservation={this.props.reservationActions.startReservation} />
        </div>
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
