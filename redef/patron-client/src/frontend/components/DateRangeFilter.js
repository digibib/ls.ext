import React, { PropTypes } from 'react'
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'

import FormInputField from '../components/FormInputField'
import asyncValidate from '../utils/asyncValidate'
import validator from '../../common/validation/validator'
import fields from '../../common/forms/postponeReservationForm'
import ValidationMessage from '../components/ValidationMessage'

const formName = 'publicationYearSelect'

class DateRangeFilter extends React.Component {
  constructor (props) {
    super(props)
    this.handleYearRange = this.handleYearRange.bind(this)
  }

  handleYearRange () {
    console.log('Handling year range...')
  }

  getValidator (field) {
    if (field.meta.touched && field.meta.error) {
      return <div className="feedback"><ValidationMessage message={field.meta.error} /></div>
    }
  }

  render () {
    const {
      submitting,
      handleSubmit
    } = this.props
    return (
      <div className="dateRangeFilters">
        <section className="filter-wrapper">
            <div className="filter-group">
              <header className="filterTitle">
                <h1>
                  <FormattedMessage {...messages.selectPublicationYear} />
                </h1>
              </header>
              <FormInputField name="yearFrom"
                              message={messages.yearFrom}
                              formName={formName}
                              getValidator={this.getValidator}
                              headerType=""
                              placeholder={messages.yearPlaceholder}
                              type="text"
              />
              <FormInputField name="yearTo"
                              message={messages.yearTo}
                              formName={formName}
                              getValidator={this.getValidator}
                              headerType=""
                              placeholder={messages.yearPlaceholder}
                              type="text"
              />
              <button
                className="black-btn"
                data-automation-id="submit_year_range_button"
                type="button"
                disabled={submitting}
                onClick={handleSubmit(this.handleYearRange)}
              >
                <FormattedMessage {...messages.limitYear} />
              </button>
            </div>
        </section>
      </div>
    )
  }
}

export const messages = defineMessages({
  selectPublicationYear: {
    id: 'SearchFilter.selectPublicationYear',
    description: 'Form label for selecting publication year',
    defaultMessage: 'Publication years'
  },
  yearFrom: {
    id: 'SearchFilter.yearFrom',
    description: 'Year from field in publication year filter',
    defaultMessage: 'From'
  },
  yearTo: {
    id: 'SearchFilter.yearTo',
    description: 'Year to field in publication year filter',
    defaultMessage: 'To'
  },
  limitYear: {
    id: 'SearchFilter.limitYearButton',
    description: 'Button to submit publication year filter',
    defaultMessage: 'Limit'
  },
  yearPlaceholder: {
    id:'SearchFilter.yearPlaceholder',
    description: 'Placeholder for year in input fields',
    defaultMessage: 'YYYY'
  }

})

const intlDateRangeFilter = injectIntl(DateRangeFilter)
export { intlDateRangeFilter as DateRangeFilter }

export default connect(
  // mapStateToProps,
  // mapDispatchToProps
)(reduxForm({
  form: formName,
  enableReinitialize: true,
  asyncValidate,
  asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
  validate: validator(fields)
})(intlDateRangeFilter))

/*
 disabled={submitting}
onClick={handleSubmit(this.handlePostponeReservation)}
*/