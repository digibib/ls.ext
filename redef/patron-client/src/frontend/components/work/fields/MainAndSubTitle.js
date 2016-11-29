import React, { PropTypes } from 'react'
import { FormattedMessage, defineMessages } from 'react-intl'

const MainAndSubTitle = ({ mainTitle, subtitle }) => (
  <h1>
    <span data-automation-id="work_title">
      {mainTitle || <FormattedMessage {...messages.noMainTitle} />}
    </span>
    <span data-automation-id="work_subtitle">
      {subtitle ? ` : ${subtitle}` : null}
    </span>
  </h1>
)

export const messages = defineMessages({
  noMainTitle: {
    id: 'MainAndSubTitle.noMainTitle',
    description: 'Shown when no main title',
    defaultMessage: '<Missing main title>'
  }
})

MainAndSubTitle.propTypes = {
  mainTitle: PropTypes.string,
  subtitle: PropTypes.string
}

export default MainAndSubTitle
