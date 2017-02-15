import React, { PropTypes } from 'react'
import { defineMessages, injectIntl, intlShape } from 'react-intl'
import MetaItem from '../../MetaItem'

const CountryOfOrigin = ({ country, intl }) => {
  if (country) {
    return (
      <MetaItem label={messages.labelCountryOfOrigin} data-automation-id="work_countryOfOrigin">
        {intl.formatMessage({ id: country })}
      </MetaItem>
    )
  } else {
    return null
  }
}

CountryOfOrigin.propTypes = {
  country: PropTypes.string,
  intl: intlShape.isRequired
}

export const messages = defineMessages({
  labelCountryOfOrigin: {
    id: 'CountryOfOrigin.labelCountryOfOrigin',
    description: 'Label for country of origin',
    defaultMessage: 'Country of origin'
  }
})

export default injectIntl(CountryOfOrigin)
