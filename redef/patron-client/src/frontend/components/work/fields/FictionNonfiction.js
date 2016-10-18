import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages } from 'react-intl'
import MetaItem from '../../MetaItem'

const FictionNonfiction = ({ fictionNonfiction, intl }) => {
  if (fictionNonfiction) {
    return (
      <MetaItem content={intl.formatMessage({ id: fictionNonfiction })}
                label={messages.labelFictionNonfiction}
                data-automation-id="work_fictionNonfiction"
      />
    )
  } else {
    return null
  }
}

FictionNonfiction.propTypes = {
  fictionNonfiction: PropTypes.string,
  intl: intlShape.isRequired

}

export const messages = defineMessages({
  labelFictionNonfiction: {
    id: 'FictionNonfiction.labelFictionNonfiction',
    description: 'Label for fictionNonfiction',
    defaultMessage: 'Fiction/non fiction'
  }
})

export default injectIntl(FictionNonfiction)
