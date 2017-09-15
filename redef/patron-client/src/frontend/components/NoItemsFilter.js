import React, { PropTypes } from 'react'
import { injectIntl, defineMessages, FormattedMessage, intlShape } from 'react-intl'
import ReactDOM from 'react-dom'

class NoItemsFilter extends React.Component {
  constructor (props) {
    super(props)
    this.toggleHideNoItems = this.toggleHideNoItems.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleKey = this.handleKey.bind(this)
  }

  toggleHideNoItems () {
    this.props.toggleHideNoItems()
  }

  handleClick (event) {
    event.preventDefault()

    this.props.toggleHideNoItems()

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
      <div className="filter-group noitemsfilter" data-automation-id="filter_noitems">
        <section className="filter-list">
          <ul className="searchfilters">
            <li>
              <input type="checkbox" id="toggleHideNoItems" name="filter" checked={this.props.isChecked} onChange={this.handleClick} aria-hidden="true" />
              <label htmlFor="toggleHideNoItems" onKeyDown={this.handleKey}>
                <div className="checkbox-wrapper">
                  <i
                    role="checkbox"
                    aria-checked="false"
                    aria-label={this.props.intl.formatMessage({ id: 'NoItemsFilter.label' })}
                    className="icon-check-empty checkbox-unchecked"
                    tabIndex="0"
                  />
                  <i
                    role="checkbox"
                    aria-checked="true"
                    aria-label={this.props.intl.formatMessage({ id: 'NoItemsFilter.label' })}
                    className="icon-ok-squared checkbox-checked"
                    tabIndex="0"
                  />
                </div>
                <h2 className="filter_label" data-automation-id="filter_label" data-checked={this.props.isChecked} aria-hidden="true">
                  <FormattedMessage {...messages.label} />
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
  label: {
    id: 'NoItemsFilter.label',
    description: 'Form label for no-items filter',
    defaultMessage: 'Only show hits with items'
  }
})

NoItemsFilter.propTypes = {
  toggleHideNoItems: PropTypes.func.isRequired,
  isChecked: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
  scrollTargetNode: PropTypes.object.isRequired
}

export default injectIntl(NoItemsFilter)
