import PropTypes from 'prop-types'
import React from 'react'
import { defineMessages, injectIntl, intlShape } from 'react-intl'
import MetaItem from '../../MetaItem'
import { Link } from 'react-router'
import fieldQueryLink from '../../../utils/link'

const CountryOfOrigin = ({ country, intl }) => {
  if (country) {
    return (
      <MetaItem label={messages.labelCountryOfOrigin} data-automation-id="work_countryOfOrigin">
        <Link to={fieldQueryLink('land', intl.formatMessage({id: country}))}>
          {intl.formatMessage({id: country})}
        </Link>
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
