import React, { PropTypes } from 'react'
import { injectIntl, defineMessages, FormattedMessage, intlShape } from 'react-intl'
import ReactDOM from 'react-dom'

class AvailableFilter extends React.Component {
  constructor (props) {
    super(props)
    this.toggleAvailability = this.toggleAvailability.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  toggleAvailability () {
    this.props.toggleAvailability()
  }

  handleClick (event) {
    event.preventDefault()

    this.props.toggleAvailability()

    if (window.innerWidth < 668) {
      ReactDOM.findDOMNode(this.props.scrollTargetNode).scrollIntoView()
    }
  }

  handleKey (event) {
    if (event.keyCode === 32) { // Space for checkbox
      event.preventDefault()
      this.handleClick(event)
    }
  }

  render () {
    return (
      <div className="filter-group" data-automation-id="filter_available">
        <section className="filter-list">
          <ul className="searchfilters">
            <li>
              <input type="checkbox" id="toggleAvailability" name="filter" checked={this.props.isChecked} onChange={this.handleClick} aria-hidden="true" />
              <label htmlFor="toggleAvailability" onKeyDown={this.handleKey}>
                <div className="checkbox-wrapper">
                  <i
                    role="checkbox"
                    aria-checked="false"
                    aria-label={this.props.intl.formatMessage({ id: 'AvailableFilter.availabilityLabel' })}
                    className="icon-check-empty checkbox-unchecked"
                    tabIndex="0"
                  />
                  <i
                    role="checkbox"
                    aria-checked="true"
                    aria-label={this.props.intl.formatMessage({ id: 'AvailableFilter.availabilityLabel' })}
                    className="icon-ok-squared checkbox-checked"
                    tabIndex="0"
                  />
                </div>
                <h2 className="filter_label" data-automation-id="filter_label" data-checked={this.props.isChecked} aria-hidden="true">
                  <FormattedMessage {...messages.availabilityLabel} />
                </h2>
              </label>
            </li>
          </ul>
        </section>
      </div>
    )
  }
}

export const messages = defineMessages({
  availabilityLabel: {
    id: 'AvailableFilter.availabilityLabel',
    description: 'Form label foravailability filter',
    defaultMessage: 'Only show available'
  }
})

AvailableFilter.propTypes = {
  toggleAvailability: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  scrollTargetNode: PropTypes.object.isRequired
}

export default injectIntl(AvailableFilter)
