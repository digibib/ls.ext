import React, { PropTypes } from 'react'
import MediaQuery from 'react-responsive'

import Author from './fields/Author'
import Year from './fields/Year'
import AdditionalInformation from './AdditionalInformation'
import Summary from './fields/Summary'
import Contributors from './fields/Contributors'
import OriginalLanguage from './fields/OriginalLanguage'
import OriginalTitle from './fields/OriginalTitle'
import CountryOfOrigin from './fields/CountryOfOrigin'
import LiteraryForms from './fields/LiteraryForms'
import Title from './fields/Title'
import title from '../../utils/title'

const WorkInformation = ({ work, publicationId, showAdditionalInformation, toggleShowAdditionalInformation, mediaQueryValues }) => {
  const originalTitle = title({mainTitle: work.mainTitle, subtitle: work.subtitle, partTitle: work.partTitle, partNumber: work.partNumber})
  const untranscribedOriginalTitle = work.untranscribedTitle
  const chosenPublication = work.publications.find(publication => publication.id === publicationId)
  let publicationTitle
  let untranscribedPublicationtitle
  if (chosenPublication) {
    publicationTitle = title({mainTitle: chosenPublication.mainTitle, subtitle: chosenPublication.subtitle, partTitle: chosenPublication.partTitle, partNumber: chosenPublication.partNumber})
    untranscribedPublicationtitle = chosenPublication.untranscribedTitle
  }

  return (
    <section className="work-information">
      <Title title={publicationTitle || originalTitle} untranscribedTitle={untranscribedPublicationtitle} />
      <Author by={work.by} />
      <OriginalTitle title={originalTitle} untranscribedTitle={untranscribedOriginalTitle} />
      <OriginalLanguage languages={work.languages} />
      <CountryOfOrigin country={work.countryOfOrigin} />
      <Year year={work.publicationYear} />
      <LiteraryForms literaryForms={work.literaryForms} />
      <Contributors contributors={work.contributors} />
      <Summary summary={work.hasSummary} />
      <MediaQuery query="(max-width: 991px)" values={{ ...mediaQueryValues }}>
        <AdditionalInformation work={work} showAdditionalInformation={showAdditionalInformation}
                               toggleShowAdditionalInformation={toggleShowAdditionalInformation} />
      </MediaQuery>
    </section>
  )
}

WorkInformation.propTypes = {
  work: PropTypes.object.isRequired,
  publicationId: PropTypes.string,
  showAdditionalInformation: PropTypes.bool.isRequired,
  toggleShowAdditionalInformation: PropTypes.func.isRequired,
  mediaQueryValues: PropTypes.object
}

export default WorkInformation
