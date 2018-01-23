import React, { PropTypes } from 'react'
import { reduxForm } from 'redux-form'
import { connect } from 'react-redux'
import { injectIntl, defineMessages, FormattedMessage } from 'react-intl'

import FormInputField from '../components/FormInputField'
import asyncValidate from '../utils/asyncValidate'
import validator from '../../common/validation/validator'
import fields from '../../common/forms/dateRangeForm'
import ValidationMessage from '../components/ValidationMessage'

const formName = 'publicationYearSelect'

class DateRangeFilter extends React.Component {
  constructor (props) {
    super(props)
    this.handleYearRange = this.handleYearRange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
  }

  handleYearRange (fields) {
    this.props.reset()
    this.props.togglePeriod({ yearFrom: fields.yearFrom || '', yearTo: fields.yearTo || '' })
  }

  handleKeyDown (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      this.props.handleSubmit(this.handleYearRange)
    }
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
      <form className="filter-group dateRangeFilters" data-automation-id="filter_dateRange"
            onSubmit={handleSubmit(this.handleYearRange)}
            onKeyDown={this.handleKeyDown}>
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
                        maxLength="4"
        />
        <FormInputField name="yearTo"
                        message={messages.yearTo}
                        formName={formName}
                        getValidator={this.getValidator}
                        headerType=""
                        placeholder={messages.yearPlaceholder}
                        type="text"
                        maxLength="4"
        />
        <button
          className="blue-btn"
          data-automation-id="submit_year_range_button"
          type="submit"
          disabled={submitting}
        >
          <FormattedMessage {...messages.limitYear} />
        </button>
      </form>
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
    id: 'SearchFilter.yearPlaceholder',
    description: 'Placeholder for year in input fields',
    defaultMessage: 'YYYY'
  }

})

DateRangeFilter.propTypes = {
  togglePeriod: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func
}

function mapDispatchToProps (dispatch) {
  return {
    dispatch: dispatch
  }
}

function mapStateToProps (state) {
  return {
    initialValues: {},
    fields: state.form.publicationYearSelect ? state.form.publicationYearSelect : {}
  }
}

const intlDateRangeFilter = injectIntl(DateRangeFilter)
export { intlDateRangeFilter as DateRangeFilter }

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(reduxForm({
  form: formName,
  enableReinitialize: true,
  asyncValidate,
  asyncBlurFields: Object.keys(fields).filter(field => fields[ field ].asyncValidation),
  validate: validator(fields)
})(intlDateRangeFilter))
