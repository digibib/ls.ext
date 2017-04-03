import React, { PropTypes } from 'react'
import NonIETransitionGroup from '../NonIETransitionGroup'
import TargetAudience from './fields/TargetAudience'
import WorkSeries from './fields/WorkSeries'
import DeweyNumber from './fields/DeweyNumber'
import Subjects from './fields/Subjects'
import Genres from './fields/Genres'
import Classifications from './fields/Classifications'
import Instrumentations from './fields/Instrumentations'
import Biographies from './fields/Biographies'
import CompositionTypes from './fields/CompositionTypes'
import Keys from './fields/Keys'
import FictionNonfiction from './fields/FictionNonfiction'
import ContentAdaptations from './fields/ContentAdaptations'
import WorkRelations from './fields/WorkRelations'

const AdditionalInformationContent = ({ work }) => (
  <NonIETransitionGroup
    transitionName="fade-in"
    transitionLeave
    transitionAppear
    transitionAppearTimeout={500}
    transitionEnterTimeout={500}
    transitionLeaveTimeout={500}
    component="div"
    className="additional-info">
      <TargetAudience audiences={work.audiences} />
      <WorkSeries workSeries={work.workSeries} />
      <WorkRelations workRelations={work.workRelations} />
      <ContentAdaptations contentAdaptations={work.contentAdaptations} />
        {/* this.renderPartOfSeries(work) */}
        {/* this.renderRelations(work) */}
      <CompositionTypes compositionTypes={work.compositionTypes} />
      <Keys keys={work.keys} />
      <DeweyNumber deweyNumber={work.deweyNumber} />
      <Classifications classifications={work.classifications} />
      <Instrumentations instrumentations={work.instrumentations} />
      <Biographies biographies={work.biographies} />
      <FictionNonfiction fictionNonfiction={work.fictionNonfiction} />
      <Genres genres={work.genres} />
      <Subjects subjects={work.subjects} />
  </NonIETransitionGroup>
)

AdditionalInformationContent.propTypes = {
  work: PropTypes.object.isRequired
}

export default AdditionalInformationContent
