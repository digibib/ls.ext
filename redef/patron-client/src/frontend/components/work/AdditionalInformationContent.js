import React, { PropTypes } from 'react'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import TargetAudience from './fields/TargetAudience'
import DeweyNumber from './fields/DeweyNumber'
import Subjects from './fields/Subjects'
import Genres from './fields/Genres'
import Classifications from './fields/Classifications'
import Instruments from './fields/Instruments'
import Biographies from './fields/Biographies'
import CompositionTypes from './fields/CompositionTypes'
import FictionNonfiction from './fields/FictionNonfiction'
import Key from './fields/Key'
import AgeLimit from './fields/AgeLimit'
import ContentAdaptations from './fields/ContentAdaptations'

const AdditionalInformationContent = ({ work }) => (
  <ReactCSSTransitionGroup
    transitionName="fade-in"
    transitionLeave
    transitionAppear
    transitionAppearTimeout={500}
    transitionEnterTimeout={500}
    transitionLeaveTimeout={500}
    component="div"
    className="additional-info">
    <TargetAudience audiences={work.audiences} />
    <ContentAdaptations contentAdaptations={work.contentAdaptations} />
    {/* this.renderPartOfSeries(work) */}
    {/* this.renderRelations(work) */}
    <DeweyNumber deweyNumber={work.deweyNumber} />
    <Classifications classifications={work.classifications} />
    <Instruments instruments={work.instruments} />
    <Biographies biographies={work.biographies} />
    <CompositionTypes compositionTypes={work.compositionTypes} />
    <FictionNonfiction fictionNonfiction={work.fictionNonfiction} />
    <AgeLimit ageLimit={work.ageLimit} />
    <Key key={work.key} />
    <Subjects subjects={work.subjects} />
    <Genres genres={work.genres} />
  </ReactCSSTransitionGroup>
)

AdditionalInformationContent.propTypes = {
  work: PropTypes.object.isRequired
}

export default AdditionalInformationContent
