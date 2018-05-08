import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages, FormattedMessage } from 'react-intl'
import AdditionalInformationContent from './AdditionalInformationContent'
import ClickableElement from '../ClickableElement'

const AdditionalInformation = ({ work, showAdditionalInformation, toggleShowAdditionalInformation }) => {
  if (showAdditionalInformation) {
    return (
      <div className="additional-info">
        <ClickableElement onClickAction={toggleShowAdditionalInformation} onClickArguments={[ work.id ]}>
          <a href="#" className="additional-info-toggle">
            <FormattedMessage {...messages.additionalInfoToggleLess} /><i className="icon-up-open" />
          </a>
        </ClickableElement>
        <AdditionalInformationContent work={work} />
      </div>
    )
  } else {
    return (
      <div className="additional-info">
        <ClickableElement onClickAction={toggleShowAdditionalInformation} onClickArguments={[ work.id ]}>
          <a href="#" className="additional-info-toggle">
            <FormattedMessage {...messages.additionalInfoToggleMore} /><i className="icon-down-open" />
          </a>
        </ClickableElement>
      </div>
    )
  }
}

AdditionalInformation.propTypes = {
  work: PropTypes.object.isRequired,
  showAdditionalInformation: PropTypes.bool.isRequired,
  toggleShowAdditionalInformation: PropTypes.func.isRequired
}

export const messages = defineMessages({
  additionalInfoToggleLess: {
    id: 'AdditionalInformation.additionalInfoToggleLess',
    description: 'Text used in trigger for displaying additional info',
    defaultMessage: 'Less about this work'
  },
  additionalInfoToggleMore: {
    id: 'AdditionalInformation.additionalInfoToggleMore',
    description: 'Text used in trigger for displaying additional info',
    defaultMessage: 'More about this work'
  }
})

export default AdditionalInformation
